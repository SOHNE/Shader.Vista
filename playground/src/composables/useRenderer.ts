import type { Ref } from 'vue'
import { onScopeDispose, readonly, ref } from 'vue'

const isClient = typeof window !== 'undefined'
const urlParams = isClient ? new URLSearchParams(window.location.search) : null
const version = urlParams?.get('version') || 'latest'

type RendererMetrics = {
  paused: boolean
  time: number
  frameRate: number
  width: number
  height: number
}

const DEFAULT_METRICS: RendererMetrics = {
  paused: false,
  time: 0,
  frameRate: 0,
  width: 0,
  height: 0,
}

export function useRenderer(canvasRef: Ref<HTMLCanvasElement | null>) {
  let renderer: any = null
  let WebGLRenderer: any = null
  let lastSuccessfulCode = ''
  let metricsFrameId = -1
  const metrics = ref<RendererMetrics>({ ...DEFAULT_METRICS })

  async function loadRenderer() {
    if (WebGLRenderer)
      return WebGLRenderer

    if (version === 'latest' || !isClient) {
      const mod = await import('@actis/core')
      WebGLRenderer = mod.WebGLRenderer
    }
    else {
      // Load from CDN
      const cdnUrl = `https://esm.sh/@actis/core@${version}`
      const mod = await import(/* @vite-ignore */ cdnUrl)
      WebGLRenderer = mod.WebGLRenderer
    }
    return WebGLRenderer
  }

  async function init() {
    if (canvasRef.value) {
      const Klass = await loadRenderer()
      if (Klass) {
        renderer = new Klass(canvasRef.value, (details: any) => {
          console.error('Renderer Error:', details)
        })
        updateMetrics()
        startMetricsLoop()
      }
    }
  }

  async function ensureRenderer() {
    if (!renderer) {
      await init()
    }

    return renderer
  }

  async function run(code: string) {
    const nextRenderer = await ensureRenderer()
    if (!nextRenderer)
      return

    try {
      // eslint-disable-next-line no-new-func
      const runCode = new Function('renderer', code)
      runCode(nextRenderer)
      lastSuccessfulCode = code
      updateMetrics()
    }
    catch (err) {
      console.error('Execution Error:', err)
    }
  }

  async function clear() {
    const nextRenderer = await ensureRenderer()
    if (!nextRenderer) {
      return
    }

    if (typeof nextRenderer.clear === 'function') {
      nextRenderer.clear()
      updateMetrics()
      return
    }

    if (lastSuccessfulCode) {
      await run(lastSuccessfulCode)
    }
  }

  async function pause() {
    const nextRenderer = await ensureRenderer()
    if (!nextRenderer) {
      return
    }

    if (typeof nextRenderer.pause === 'function') {
      nextRenderer.pause()
      updateMetrics()
    }
  }

  async function resume() {
    const nextRenderer = await ensureRenderer()
    if (!nextRenderer) {
      return
    }

    if (typeof nextRenderer.resume === 'function') {
      nextRenderer.resume()
      updateMetrics()
      return
    }

    if (typeof nextRenderer.play === 'function') {
      nextRenderer.play()
      updateMetrics()
    }
  }

  async function togglePlayback() {
    const nextRenderer = await ensureRenderer()
    if (!nextRenderer) {
      return
    }

    const nextMetrics = readMetrics()
    if (nextMetrics.paused) {
      await resume()
      return
    }

    await pause()
  }

  function startMetricsLoop() {
    if (!isClient || metricsFrameId !== -1 || typeof requestAnimationFrame === 'undefined') {
      return
    }

    const tick = () => {
      updateMetrics()
      metricsFrameId = requestAnimationFrame(tick)
    }

    tick()
  }

  function stopMetricsLoop() {
    if (metricsFrameId === -1 || typeof cancelAnimationFrame === 'undefined') {
      metricsFrameId = -1
      return
    }

    cancelAnimationFrame(metricsFrameId)
    metricsFrameId = -1
  }

  function readMetrics(): RendererMetrics {
    if (typeof renderer?.getMetrics === 'function') {
      return renderer.getMetrics()
    }

    return {
      paused: Boolean(renderer?.paused ?? false),
      time: Number(renderer?.currentTime ?? renderer?.time ?? 0),
      frameRate: Number(renderer?.frameRate ?? 0),
      width: Number(renderer?.canvas?.width ?? canvasRef.value?.width ?? 0),
      height: Number(renderer?.canvas?.height ?? canvasRef.value?.height ?? 0),
    }
  }

  function updateMetrics() {
    metrics.value = readMetrics()
  }

  onScopeDispose(() => {
    stopMetricsLoop()
  })

  return {
    run,
    init,
    clear,
    pause,
    resume,
    togglePlayback,
    metrics: readonly(metrics),
  }
}
