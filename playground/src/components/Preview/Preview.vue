<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useRenderer } from '../../composables/useRenderer'

const props = defineProps<{
  code: string
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { run, init } = useRenderer(canvasRef)

const { isFullscreen, toggle } = useFullscreen(containerRef)

onMounted(() => {
  init()
  run(props.code)
})

watch(() => props.code, (newCode) => {
  run(newCode)
})
</script>

<template>
  <div ref="containerRef" class="preview-container relative h-full w-full bg-black overflow-hidden group">
    <canvas ref="canvasRef" class="w-full h-full block" />

    <button
      class="absolute bottom-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 sm:opacity-0 touch-none"
      :class="{ 'opacity-100': isFullscreen }"
      title="Toggle Fullscreen"
      @click="toggle"
    >
      <div :class="isFullscreen ? 'i-carbon-minimize' : 'i-carbon-maximize'" class="text-lg" />
    </button>
  </div>
</template>
