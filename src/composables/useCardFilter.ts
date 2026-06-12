import { ref } from 'vue'

const searchQuery = ref('')

export function useCardFilter() {
  return { searchQuery }
}
