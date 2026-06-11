<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menus = [
  { path: '/dashboard', title: '工作台', icon: '◉' },
  { path: '/user', title: '用户管理', icon: '◎' },
]

const activePath = computed(() => route.path)
const pageTitle = computed(() => (route.meta.title as string) || '')
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="logo">BigHead Admin</div>
      <nav class="menu">
        <a
          v-for="item in menus"
          :key="item.path"
          class="menu-item"
          :class="{ active: activePath.startsWith(item.path) }"
          @click="router.push(item.path)"
        >
          <span class="icon">{{ item.icon }}</span>
          {{ item.title }}
        </a>
      </nav>
    </aside>

    <div class="main">
      <header class="header">
        <h1>{{ pageTitle }}</h1>
        <div class="user">Admin</div>
      </header>
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #001529;
  color: #fff;
}

.logo {
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu {
  padding: 12px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover,
.menu-item.active {
  color: #fff;
  background: #1890ff;
}

.icon {
  font-size: 14px;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #f0f2f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header h1 {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.user {
  font-size: 14px;
  color: #666;
}

.content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}
</style>
