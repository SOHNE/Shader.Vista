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

        // Monkey-patch setup to clear state first since we can't modify core
        let lastConfig: any = null
        const originalSetup = renderer.setup.bind(renderer)
        renderer.setup = (config: any) => {
          lastConfig = config
          if (renderer.animationRequestID !== -1) {
            cancelAnimationFrame(renderer.animationRequestID)
            renderer.animationRequestID = -1
          }
          renderer.passes = null
          renderer.textureMap = new Map()
          renderer.reset()
          originalSetup(config)
        }

        // Monkey-patch resize to fix broken texture links when passes recreate their textures
        const originalResize = renderer.resizeCanvasToDisplaySize.bind(renderer)
        renderer.resizeCanvasToDisplaySize = () => {
          const displayWidth = Math.floor(
            renderer.canvas.clientWidth * renderer.realToCSSPixels,
          )
          const displayHeight = Math.floor(
            renderer.canvas.clientHeight * renderer.realToCSSPixels,
          )

          if (
            renderer.canvas.width !== displayWidth
            || renderer.canvas.height !== displayHeight
          ) {
            originalResize()

            let current = renderer.passes
            while (current) {
              const passName = current.shader.passName
              if (passName) {
                renderer.textureMap.set(passName, current.texture)
              }
              current = current.next
            }

            if (lastConfig && lastConfig.passes) {
              current = renderer.passes
              while (current) {
                const passName = current.shader.passName
                const passConf = lastConfig.passes.find((p: any) => p.name === passName)
                if (passConf && passConf.textures) {
                  current.textures = passConf.textures.map((tName: string) => renderer.textureMap.get(tName))
                }
                current = current.next
              }
            }
          }
        }
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
