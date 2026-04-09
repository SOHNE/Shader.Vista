<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useRenderer } from '../../composables/useRenderer'
import ControlPanel from './ControlPanel.vue'
import FullscreenButton from './FullscreenButton.vue'
import InfoPanel from './InfoPanel.vue'

const props = defineProps<{
  code: string
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { run, init, clear, metrics, togglePlayback } = useRenderer(canvasRef)

const { isFullscreen, toggle } = useFullscreen(containerRef)

async function resetPipeline() {
  await clear()
}

async function toggleRendererPlayback() {
  await togglePlayback()
}

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

    <!-- Playback & Reset Controls -->
    <div
      class="opacity-0 transition-all bottom-3 left-3 absolute group-hover:opacity-100 sm:opacity-0"
      :class="{ 'opacity-100': isFullscreen }"
    >
      <ControlPanel :paused="metrics.paused" @reset="resetPipeline" @toggle-playback="toggleRendererPlayback" />
    </div>

    <!-- Info overlay -->
    <div
      class="opacity-0 transition-all bottom-3 left-16 absolute group-hover:opacity-100 sm:opacity-0"
      :class="{ 'opacity-100': isFullscreen }"
    >
      <InfoPanel
        :time="metrics.time.toFixed(1)" :frame-rate="`${Math.max(0, Math.round(metrics.frameRate))}fps`"
        :resolution="`${metrics.width}x${metrics.height}`"
      />
    </div>

    <!-- Fullscreen Toggle -->
    <div
      class="opacity-0 transition-all bottom-3 right-3 absolute group-hover:opacity-100 sm:opacity-0"
      :class="{ 'opacity-100': isFullscreen }"
    >
      <FullscreenButton :is-fullscreen="isFullscreen" @toggle="toggle" />
    </div>
  </div>
</template>
