import type { Ref } from 'vue'
import { WebGLRenderer } from '@sohne/shader.vista'

export function useRenderer(canvasRef: Ref<HTMLCanvasElement | null>) {
  let renderer: WebGLRenderer | null = null

  function init() {
    if (canvasRef.value) {
      renderer = new WebGLRenderer(canvasRef.value, (details) => {
        console.error('Renderer Error:', details)
      })
    }
  }

  function run(code: string) {
    if (!renderer) {
      init()
    }
    if (!renderer)
      return

    try {
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
