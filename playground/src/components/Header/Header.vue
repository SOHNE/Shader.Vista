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
  <header class="header-layout px-2 sm:px-3 py-1 sm:py-1.5 h-9 sm:h-10">
    <div class="flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink">
      <Brand class="flex-shrink-0" />
      <VersionSelector class="flex-shrink" />
    </div>

    <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
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
