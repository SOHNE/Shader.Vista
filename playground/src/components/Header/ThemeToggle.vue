<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <button
    class="text-base icon-btn flex items-center" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    @click="toggleDark()"
  >
    <div :class="isDark ? 'i-carbon-moon' : 'i-carbon-sun'" />
  </button>
</template>
