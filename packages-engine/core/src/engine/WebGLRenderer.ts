import type { PassConfig, RendererConfig } from '../types'
import Pass from '../pass/Pass'
import Shader from '../shader/Shader'

/**
 * Renderer class responsible for managing the WebGL context, render passes, and animation loop.
 */
export default class WebGLRenderer {
  private gl: WebGLRenderingContext
  private passes: Pass | null
  private canvas: HTMLCanvasElement
  private animationRequestID: number
  private textureMap: Map<string, WebGLTexture>
  private now: Date
  private onError: (details: { passName: string, coords: { line: number, message: string } }) => void

  public mouseX: number
  public mouseY: number
  public time: number
  public timeDelta: number
  public realToCSSPixels: number
  public paused: boolean
  public playbackTime: number
  public lastTime: number
  public frameRate: number
  public currentFrame: number
  public currentTime: number
  public startTime: number

  constructor(
    canvas: HTMLCanvasElement,
    onError?: (details: { passName: string, coords: { line: number, message: string } }) => void,
  ) {
    this.canvas = canvas
    this.animationRequestID = -1
    this.gl = this.initializeWebGLContext(canvas)
    this.passes = null
    this.textureMap = new Map()
    this.now = new Date()
    this.onError = onError || (({ passName, coords }) => {
      console.error(`[Actis] Error in pass "${passName}" at line ${coords.line}: ${coords.message}`)
    })

    this.mouseX = 0
    this.mouseY = 0
    this.time = 0
    this.timeDelta = 0
    this.realToCSSPixels = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    this.paused = false
    this.playbackTime = 0
    this.lastTime = 0
    this.frameRate = 0
    this.currentFrame = 0
    this.currentTime = 0
    this.startTime = 0

    this.initMouseEvents()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeCanvasToDisplaySize.bind(this))
    }
  }

  private initializeWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext {
    const opts = {
      alpha: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    }

    const gl
      = canvas.getContext('webgl2', opts)
        || canvas.getContext('experimental-webgl2', opts)
        || canvas.getContext('webgl', opts)
        || canvas.getContext('experimental-webgl', opts)

    if (!gl) {
      throw new Error('WebGL not supported')
    }

    return gl as WebGLRenderingContext
  }

  private initMouseEvents(): void {
    this.canvas.addEventListener('mousemove', this.setMousePosition.bind(this))
    this.canvas.addEventListener('touchstart', this.preventDefault, { passive: false })
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
  }

  private setMousePosition(e: MouseEvent | Touch): void {
    const mouse = {
      x: e.clientX || e.pageX,
      y: e.clientY || e.pageY,
    }

    const rect = this.canvas.getBoundingClientRect()
    if (mouse.x >= rect.left && mouse.x <= rect.right && mouse.y >= rect.top && mouse.y <= rect.bottom) {
      this.mouseX = (mouse.x - rect.left) * this.realToCSSPixels
      this.mouseY = this.canvas.height - (mouse.y - rect.top) * this.realToCSSPixels
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault()
    if (e.touches.length > 0) {
      this.setMousePosition(e.touches[0])
    }
  }

  private preventDefault(e: Event): void {
    e.preventDefault()
  }

  public addPass(pass: Pass): void {
    if (this.passes) {
      let current = this.passes
      while (current.next) {
        current = current.next
      }
      current.next = pass
    }
    else {
      this.passes = pass
    }
  }

  private resizeCanvasToDisplaySize(): void {
    const displayWidth = Math.floor(this.canvas.clientWidth * this.realToCSSPixels)
    const displayHeight = Math.floor(this.canvas.clientHeight * this.realToCSSPixels)

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth
      this.canvas.height = displayHeight

      let current = this.passes
      while (current) {
        current.resize(displayWidth, displayHeight)
        current = current.next
      }
    }
  }

  private updateUniforms(pass: Pass): void {
    const uniforms = {
      u_date: [
        this.now.getFullYear(),
        this.now.getMonth() + 1,
        this.now.getDate(),
        this.now.getHours() * 3600
        + this.now.getMinutes() * 60
        + this.now.getSeconds()
        + this.now.getMilliseconds() / 1000,
      ],
      u_frame: this.currentFrame,
      u_time: this.currentTime,
      u_timeDelta: this.timeDelta,
      u_frameRate: this.frameRate,
      u_resolution: [pass.width, pass.height],
      u_mouse: [this.mouseX, this.mouseY],
    }
    pass.shader.setUniforms(uniforms)
  }

  private updateTime(currentTime?: number): void {
    if (this.paused) {
      this.timeDelta = 0
      return
    }

    const t = currentTime ?? (typeof performance !== 'undefined' ? performance.now() : Date.now())
    if (this.startTime === 0)
      this.startTime = t

    if (this.lastTime === 0) {
      this.lastTime = t
    }

    this.timeDelta = (t - this.startTime) / 1000.0
    this.currentTime += this.timeDelta
    this.frameRate = 1.0 / this.timeDelta
    this.currentFrame++
    this.startTime = t
  }

  public render(currentTime: number): void {
    this.updateTime(currentTime)
    this.resizeCanvasToDisplaySize()

    let current = this.passes
    while (current) {
      current.use()
      this.updateUniforms(current)
      current.draw()
      current = current.next
    }

    // FIXME: Placed here just to maintain a render loop. Must be redone later.
    if (typeof requestAnimationFrame !== 'undefined') {
      this.animationRequestID = requestAnimationFrame(this.render.bind(this))
    }
  }

  public setup(config: RendererConfig): void {
    // Clear previous state
    if (this.animationRequestID !== -1) {
      cancelAnimationFrame(this.animationRequestID)
      this.animationRequestID = -1
    }
    this.passes = null
    this.textureMap.clear()
    this.reset()

    const displayWidth = Math.floor(this.canvas.clientWidth * this.realToCSSPixels)
    const displayHeight = Math.floor(this.canvas.clientHeight * this.realToCSSPixels)

    config.passes.forEach((passConfig: PassConfig) => {
      try {
        const shader = new Shader(
          this.gl,
          passConfig.vertexShader,
          passConfig.fragmentShader,
          this.onError,
          passConfig.name,
        )
        const offscreen = passConfig.offscreen || passConfig.name !== 'MainBuffer'
        const pass = new Pass(
          this.gl,
          shader,
          displayWidth,
          displayHeight,
          offscreen,
          passConfig.textures.map((textureName) => {
            const texture = this.textureMap.get(textureName)
            if (!texture) {
              console.warn(`Texture ${textureName} not found for pass ${passConfig.name}`)
            }
            return texture as WebGLTexture
          }).filter(Boolean),
        )
        this.addPass(pass)

        // Map this pass's texture to its name
        if (pass.texture) {
          this.textureMap.set(passConfig.name, pass.texture)
        }
      }
      catch (error: unknown) {
        console.error(`Error in pass ${passConfig.name}: ${(error as any).message}`)
      }
    })
  }

  public play(): void {
    this.paused = false
    this.animationRequestID = requestAnimationFrame(this.render.bind(this))
  }

  public pause(): void {
    this.paused = true
    cancelAnimationFrame(this.animationRequestID)
  }

  public reset(): void {
    this.playbackTime = 0
    this.currentFrame = 0
    this.lastTime = 0
    this.frameRate = 0
  }
}
