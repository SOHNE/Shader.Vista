<script setup lang="ts">
import Brand from './Brand.vue'
import Share from './Share.vue'
import ThemeToggle from './ThemeToggle.vue'
import VersionSelector from './VersionSelector.vue'

defineProps<{
  code: string
}>()
</script>

<template>
  <header class="header-layout">
    <div class="flex items-center gap-2">
      <Brand />
      <VersionSelector />
    </div>

    <div class="flex items-center gap-3">
      <Share :code="code" />
      <a
        href="https://github.com/zschzen/Shader.Vista"
        target="_blank"
        class="i-simple-icons-github text-base icon-btn"
        title="GitHub Repository"
      />
      <ThemeToggle />
    </div>
  </header>
</template>
