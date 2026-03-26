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

onMounted(async () => {
  await init()
  run(props.code)
})

watch(() => props.code, (newCode) => {
  run(newCode)
})
</script>

<template>
  <div ref="containerRef" class="preview-container group bg-black h-full w-full relative overflow-hidden">
    <canvas ref="canvasRef" class="h-full w-full block" />

    <button
      class="text-white/50 p-2 rounded-full bg-black/20 opacity-0 cursor-pointer transition-all bottom-3 right-3 absolute backdrop-blur-sm touch-none hover:text-white hover:bg-black/40 group-hover:opacity-100 sm:opacity-0"
      :class="{ 'opacity-100': isFullscreen }" title="Toggle Fullscreen" @click="toggle"
    >
      <div :class="isFullscreen ? 'i-carbon-minimize' : 'i-carbon-maximize'" class="text-lg" />
    </button>
  </div>
</template>
