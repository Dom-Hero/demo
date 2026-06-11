<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FloatingLines from '@/components/background/FloatingLines.vue'
import CardNav from '@/components/CardNav.vue'

const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)

const items = [
  {
    label: "About",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "Company", ariaLabel: "About Company" },
      { label: "Careers", ariaLabel: "About Careers" }
    ]
  },
  {
    label: "Projects",
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "Featured", ariaLabel: "Featured Projects" },
      { label: "Case Studies", ariaLabel: "Project Case Studies" }
    ]
  },
  {
    label: "Contact",
    bgColor: "#271E37",
    textColor: "#fff",
    links: [
      { label: "Email", ariaLabel: "Email us" },
      { label: "Twitter", ariaLabel: "Twitter" },
      { label: "LinkedIn", ariaLabel: "LinkedIn" }
    ]
  }
]

// lineCount 按 enabledWaves 顺序对应每层：[top, middle, bottom]
const enabledWaves: Array<'top' | 'middle' | 'bottom'> = ['top', 'middle', 'bottom']
const lineCount = [5, 5, 5]
const lineDistance = [8, 6, 4]

const activePath = computed(() => route.path)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function navigate(path: string) {
  router.push(path)
  menuOpen.value = false
}
</script>

<template>
  <div class="layout">
    <FloatingLines class="layout-bg" :enabled-waves="enabledWaves" :line-count="lineCount" :line-distance="lineDistance"
      :bend-radius="5.0" :bend-strength="-0.5" :interactive="true" :parallax="true" interaction-scope="parent"
      mix-blend-mode="normal" />
    <div class="layout-header">
      <CardNav logo="大头专属" logoAlt="大头专属" :items="items" baseColor="#fff" menuColor="#000" buttonBgColor="#111"
        buttonTextColor="#fff" ease="power3.out" />
    </div>
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.layout {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
}

.layout-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.layout-header {
  position: relative;
  flex-shrink: 0;
  z-index: 2;
  min-height: calc(1.2em + 60px + 1em);
}

@media (min-width: 768px) {
  .layout-header {
    min-height: calc(2em + 60px + 1em);
  }
}

.content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 32px 32px;
}
</style>
