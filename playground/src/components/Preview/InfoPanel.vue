<script setup lang="ts">
defineProps<{
  time: string
  frameRate: string
  resolution: string
}>()
</script>

<template>
  <div class="ctrl-panel">
    <div class="px-2 py-1.5 flex gap-2 items-center">
      <span class="info-value">{{ time }}</span>
      <div class="bg-white/20 h-3 w-px" aria-hidden="true" />
      <span class="info-value">{{ frameRate }}</span>
      <div class="bg-white/20 h-3 w-px" aria-hidden="true" />
      <span class="info-value">{{ resolution }}</span>
    </div>
  </div>
</template>
