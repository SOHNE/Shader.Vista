<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isFullscreen: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const label = computed(() => props.isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen')
const icon = computed(() => props.isFullscreen ? 'i-carbon-minimize' : 'i-carbon-maximize')
</script>

<template>
  <div class="ctrl-panel p-1.5">
    <button
      class="ctrl-btn"
      :aria-label="label"
      :title="label"
      @click="emit('toggle')"
      @keydown.enter.prevent="emit('toggle')"
      @keydown.space.prevent="emit('toggle')"
    >
      <div :class="icon" class="text-lg" aria-hidden="true" />
    </button>
  </div>
</template>
