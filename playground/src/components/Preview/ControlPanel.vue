<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  paused: boolean
}>()

const emit = defineEmits<{
  reset: []
  togglePlayback: []
}>()

const playback = computed(() => ({
  title: props.paused ? 'Resume' : 'Pause',
  icon: props.paused ? 'i-carbon-play' : 'i-carbon-pause',
}))
</script>

<template>
  <div class="ctrl-panel p-1.5 flex flex-col gap-1 items-center">
    <button
      class="ctrl-btn"
      aria-label="Reset Pipeline"
      title="Reset Pipeline"
      @click="emit('reset')"
      @keydown.enter.prevent="emit('reset')"
      @keydown.space.prevent="emit('reset')"
    >
      <div class="i-carbon:reset text-lg" aria-hidden="true" />
    </button>

    <div class="bg-white/10 h-px w-5" aria-hidden="true" />

    <button
      class="ctrl-btn"
      :aria-label="playback.title"
      :title="playback.title"
      @click="emit('togglePlayback')"
      @keydown.enter.prevent="emit('togglePlayback')"
      @keydown.space.prevent="emit('togglePlayback')"
    >
      <div :class="playback.icon" class="text-lg" aria-hidden="true" />
    </button>
  </div>
</template>
