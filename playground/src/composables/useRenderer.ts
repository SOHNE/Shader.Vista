import type { Ref } from 'vue'

const isClient = typeof window !== 'undefined'
const urlParams = isClient ? new URLSearchParams(window.location.search) : null
const version = urlParams?.get('version') || 'latest'

export function useRenderer(canvasRef: Ref<HTMLCanvasElement | null>) {
  let renderer: any = null
  let WebGLRenderer: any = null

  async function loadRenderer() {
    if (WebGLRenderer)
      return WebGLRenderer

    if (version === 'latest' || !isClient) {
      const mod = await import('@sohne/shader.vista')
      WebGLRenderer = mod.WebGLRenderer
    }
    else {
      // Load from CDN
      const cdnUrl = `https://esm.sh/@sohne/shader.vista@${version}`
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
      }
    }
  }

  async function run(code: string) {
    if (!renderer) {
      await init()
    }
    if (!renderer)
      return

    try {
      // eslint-disable-next-line no-new-func
      const runCode = new Function('renderer', code)
      runCode(renderer)
    }
    catch (err) {
      console.error('Execution Error:', err)
    }
  }

  return {
    run,
    init,
  }
}
