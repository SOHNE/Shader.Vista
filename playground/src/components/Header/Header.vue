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
  <header
    class="px-2 py-1 border-b border-border bg-canvas flex h-9 items-center justify-between sm:px-3 sm:py-1.5 sm:h-10"
  >
    <div class="flex flex-shrink gap-1 min-w-0 items-center sm:gap-2">
      <Brand class="flex-shrink-0" />
      <VersionSelector class="flex-shrink" />
    </div>

    <div class="flex flex-shrink-0 gap-2 items-center sm:gap-3">
      <Share :code="code" />
      <a
        href="https://github.com/SOHNE/Actis" target="_blank" class="i-simple-icons-github text-base icon-btn"
        title="GitHub Repository"
      />
      <ThemeToggle />
    </div>
  </header>
</template>
