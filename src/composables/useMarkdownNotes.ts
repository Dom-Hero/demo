import { ref, computed } from 'vue'

const STORAGE_KEY = 'markdown-notes'

export interface MarkdownFile {
  id: string
  name: string
  content: string
  folderId: string | null
  updatedAt: number
}

export interface MarkdownFolder {
  id: string
  name: string
  createdAt: number
}

export interface NotesData {
  files: MarkdownFile[]
  folders: MarkdownFolder[]
}

function createId() {
  return crypto.randomUUID()
}

function loadFromStorage(): NotesData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { files: [], folders: [] }
    const parsed = JSON.parse(raw) as NotesData
    return {
      files: Array.isArray(parsed.files) ? parsed.files : [],
      folders: Array.isArray(parsed.folders) ? parsed.folders : [],
    }
  } catch {
    return { files: [], folders: [] }
  }
}

function saveToStorage(data: NotesData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const INVALID_NAME_PATTERN = /[\\/:*?"<>|]/
const DEFAULT_FILE_EXTENSION = '.md'

function toMarkdownFileName(name: string) {
  const baseName = name.trim().replace(/\.md$/i, '') || '未命名'
  return `${baseName}${DEFAULT_FILE_EXTENSION}`
}

function normalizeNameForCompare(name: string) {
  return name.trim().toLowerCase()
}

export interface NameValidationResult {
  valid: boolean
  message?: string
}

function validateItemName(name: string): NameValidationResult {
  const trimmed = name.trim()
  if (!trimmed) {
    return { valid: false, message: '名称不能为空' }
  }
  if (INVALID_NAME_PATTERN.test(trimmed)) {
    return { valid: false, message: '名称不能包含 \\ / : * ? " < > | 等非法字符' }
  }
  if (trimmed === '.' || trimmed === '..') {
    return { valid: false, message: '名称不能为 . 或 ..' }
  }
  if (/[. ]$/.test(trimmed)) {
    return { valid: false, message: '名称不能以空格或点号结尾' }
  }
  return { valid: true }
}

function hasDuplicateName(
  name: string,
  folderId: string | null,
  notes: NotesData,
) {
  const normalized = normalizeNameForCompare(name)

  if (folderId === null) {
    const rootFileConflict = notes.files
      .filter((f) => f.folderId === null)
      .some((f) => normalizeNameForCompare(f.name) === normalized)
    const folderConflict = notes.folders.some(
      (f) => normalizeNameForCompare(f.name) === normalized,
    )
    return rootFileConflict || folderConflict
  }

  return notes.files
    .filter((f) => f.folderId === folderId)
    .some((f) => normalizeNameForCompare(f.name) === normalized)
}

export function useMarkdownNotes() {
  const data = ref<NotesData>(loadFromStorage())

  const rootFiles = computed(() =>
    data.value.files.filter((f) => f.folderId === null),
  )

  const folders = computed(() => data.value.folders)

  function persist() {
    saveToStorage(data.value)
  }

  function getFilesInFolder(folderId: string) {
    return data.value.files.filter((f) => f.folderId === folderId)
  }

  function validateCreateName(
    name: string,
    type: 'file' | 'folder',
    folderId: string | null = null,
  ): NameValidationResult {
    const trimmed = name.trim()

    if (type === 'file') {
      const baseName = trimmed.replace(/\.md$/i, '') || '未命名'
      const nameCheck = validateItemName(baseName)
      if (!nameCheck.valid) return nameCheck

      const fileName = toMarkdownFileName(trimmed)
      const scopeFolderId = folderId
      if (hasDuplicateName(fileName, scopeFolderId, data.value)) {
        return { valid: false, message: `「${fileName}」已存在，请使用其他名称` }
      }
      return { valid: true }
    }

    const nameCheck = validateItemName(trimmed)
    if (!nameCheck.valid) return nameCheck

    if (hasDuplicateName(trimmed, null, data.value)) {
      return { valid: false, message: `「${trimmed}」已存在，请使用其他名称` }
    }
    return { valid: true }
  }

  function createFile(name?: string, folderId: string | null = null): MarkdownFile {
    const fileName = toMarkdownFileName(name || '未命名')
    const validation = validateCreateName(name || '未命名', 'file', folderId)
    if (!validation.valid) {
      throw new Error(validation.message)
    }
    const file: MarkdownFile = {
      id: createId(),
      name: fileName,
      content: '',
      folderId,
      updatedAt: Date.now(),
    }
    data.value.files.push(file)
    persist()
    return file
  }

  function createFolder(name?: string): MarkdownFolder {
    const folderName = name?.trim() || '新建文件夹'
    const validation = validateCreateName(folderName, 'folder')
    if (!validation.valid) {
      throw new Error(validation.message)
    }
    const folder: MarkdownFolder = {
      id: createId(),
      name: folderName,
      createdAt: Date.now(),
    }
    data.value.folders.push(folder)
    persist()
    return folder
  }

  function updateFileContent(id: string, content: string) {
    const file = data.value.files.find((f) => f.id === id)
    if (!file) return
    file.content = content
    file.updatedAt = Date.now()
    persist()
  }

  function getFileById(id: string) {
    return data.value.files.find((f) => f.id === id)
  }

  function deleteFile(id: string) {
    data.value.files = data.value.files.filter((f) => f.id !== id)
    persist()
  }

  function deleteFolder(id: string) {
    data.value.files = data.value.files.filter((f) => f.folderId !== id)
    data.value.folders = data.value.folders.filter((f) => f.id !== id)
    persist()
  }

  function deleteItems(fileIds: string[], folderIds: string[]) {
    const folderSet = new Set(folderIds)
    data.value.files = data.value.files.filter(
      (f) => !fileIds.includes(f.id) && !folderSet.has(f.folderId ?? ''),
    )
    data.value.folders = data.value.folders.filter((f) => !folderSet.has(f.id))
    persist()
  }

  function moveFile(id: string, folderId: string | null): boolean {
    const file = data.value.files.find((f) => f.id === id)
    if (!file || file.folderId === folderId) return true

    const others = {
      files: data.value.files.filter((f) => f.id !== id),
      folders: data.value.folders,
    }
    if (hasDuplicateName(file.name, folderId, others)) return false

    file.folderId = folderId
    file.updatedAt = Date.now()
    persist()
    return true
  }

  return {
    data,
    rootFiles,
    folders,
    persist,
    getFilesInFolder,
    validateCreateName,
    createFile,
    createFolder,
    updateFileContent,
    getFileById,
    deleteFile,
    deleteFolder,
    deleteItems,
    moveFile,
  }
}
