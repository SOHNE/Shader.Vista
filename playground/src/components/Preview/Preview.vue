<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRenderer } from '../../composables/useRenderer'

const props = defineProps<{
  code: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { run, init } = useRenderer(canvasRef)

onMounted(() => {
  init()
  run(props.code)
})

watch(() => props.code, (newCode) => {
  run(newCode)
})
</script>

<template>
  <div class="preview-container h-full w-full bg-black overflow-hidden">
    <canvas ref="canvasRef" class="w-full h-full block"></canvas>
  </div>
</template>
