import type { BufferInfo } from 'twgl.js'
import type Texture from '../texture/Texture'
import type { GL, PipelinePlan, RendererConfig, RendererMetrics, ResolvedPassConfig } from '../types'
import { bindFramebufferInfo, drawBufferInfo, setBuffersAndAttributes, setUniforms } from 'twgl.js'
import Pass from '../pass/Pass'
import Pipeline from '../pipeline/Pipeline'
import PipelineCompiler from '../pipeline/PipelineCompiler'
import Shader from '../shader/Shader'
import { getScreenTriangle } from './ScreenTriangle'

/**
 * Renderer class responsible for managing the WebGL context, render passes, and animation loop.
 */
export default class WebGLRenderer {
  private static readonly presentFragmentShader = `
    precision highp float;
    uniform sampler2D u_texture0;
    uniform vec2 u_resolution;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      gl_FragColor = texture2D(u_texture0, uv);
    }
  `

  private gl: GL
  private pipeline: Pipeline
  private canvas: HTMLCanvasElement
  private animationRequestID: number
  private passConfigs: Map<string, ResolvedPassConfig>
  private textureMap: Map<string, Texture>
  private now: Date
  private onError: (details: { passName: string, coords: { line: number, message: string } }) => void
  private readonly compiler: PipelineCompiler
  private readonly presentShader: Shader
  private readonly screenTriangle: BufferInfo

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
  private pausedAt: number

  constructor(
    canvas: HTMLCanvasElement,
    onError?: (details: { passName: string, coords: { line: number, message: string } }) => void,
  ) {
    this.canvas = canvas
    this.animationRequestID = -1
    this.gl = this.initializeWebGLContext(canvas)
    this.pipeline = new Pipeline()
    this.passConfigs = new Map()
    this.textureMap = new Map()
    this.now = new Date()
    this.compiler = new PipelineCompiler()
    this.screenTriangle = getScreenTriangle(this.gl)
    this.onError = onError || (({ passName, coords }) => {
      console.error(`[Actis] Error in pass "${passName}" at line ${coords.line}: ${coords.message}`)
    })
    this.presentShader = new Shader(
      this.gl,
      undefined,
      WebGLRenderer.presentFragmentShader,
      () => { },
      '__actis_present__',
    )

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
    this.pausedAt = 0

    this.initMouseEvents()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeCanvasToDisplaySize.bind(this))
    }
  }

  private initializeWebGLContext(canvas: HTMLCanvasElement): GL {
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

    return gl as GL
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
    this.pipeline.add(pass.shader.passName, pass)
  }

  public getPass(name: string): Pass | undefined {
    return this.pipeline.get(name)
  }

  public getPasses(): Pass[] {
    return this.pipeline.toArray()
  }

  public forEachPass(callback: (pass: Pass) => void): void {
    this.pipeline.forEach(callback)
  }

  public getMetrics(): RendererMetrics {
    return {
      paused: this.paused,
      time: this.currentTime,
      frameRate: this.frameRate,
      width: this.canvas.width,
      height: this.canvas.height,
    }
  }

  public clear(): void {
    this.resetPlaybackState()
    this.pipeline.forEach(pass => pass.clear())
    this.syncPassTextures()
    this.clearCanvas()

    if (this.getPasses().length > 0) {
      this.renderFrame()
    }
  }

  private resizeCanvasToDisplaySize(): void {
    const displayWidth = Math.floor(this.canvas.clientWidth * this.realToCSSPixels)
    const displayHeight = Math.floor(this.canvas.clientHeight * this.realToCSSPixels)

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth
      this.canvas.height = displayHeight

      this.pipeline.resize(displayWidth, displayHeight)
      this.syncPassTextures()
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
    this.now = new Date()

    if (this.paused) {
      this.timeDelta = 0
      this.frameRate = 0
      return
    }

    const t = currentTime ?? (typeof performance !== 'undefined' ? performance.now() : Date.now())
    const hasStarted = this.startTime !== 0
    if (this.startTime === 0)
      this.startTime = t

    if (this.pausedAt !== 0) {
      if (hasStarted) {
        this.startTime += t - this.pausedAt
      }
      this.pausedAt = 0
      this.lastTime = t
      this.timeDelta = 0
    }
    else if (this.lastTime === 0) {
      this.lastTime = t
      this.timeDelta = 0
    }
    else {
      this.timeDelta = (t - this.lastTime) / 1000.0
      this.lastTime = t
    }

    this.currentTime = (t - this.startTime) / 1000.0
    this.time = this.currentTime
    this.playbackTime = this.currentTime
    this.frameRate = this.timeDelta > 0 ? 1.0 / this.timeDelta : 0
    this.currentFrame++
  }

  public render(currentTime: number): void {
    this.renderFrame(currentTime)

    // FIXME: Placed here just to maintain a render loop. Must be redone later.
    if (!this.paused && typeof requestAnimationFrame !== 'undefined') {
      this.animationRequestID = requestAnimationFrame(this.render.bind(this))
    }
    else {
      this.animationRequestID = -1
    }
  }

  public setup(config: RendererConfig): void {
    // Clear previous state
    this.cancelAnimationLoop()
    this.pipeline.clear()
    this.passConfigs.clear()
    this.textureMap.clear()
    this.resetPlaybackState()
    this.clearCanvas()

    const displayWidth = Math.floor(this.canvas.clientWidth * this.realToCSSPixels)
    const displayHeight = Math.floor(this.canvas.clientHeight * this.realToCSSPixels)
    let pipelinePlan: PipelinePlan

    try {
      pipelinePlan = this.compiler.compile(config)
    }
    catch (error: unknown) {
      console.error(`[Actis] Failed to compile pipeline: ${(error as Error).message}`)
      return
    }

    pipelinePlan.passes.forEach((passConfig) => {
      this.passConfigs.set(passConfig.name, passConfig)

      try {
        const shader = new Shader(
          this.gl,
          passConfig.vertexShader,
          passConfig.fragmentShader,
          this.onError,
          passConfig.name,
        )

        const pass = new Pass(
          this.gl,
          shader,
          this.screenTriangle,
          displayWidth,
          displayHeight,
          passConfig.offscreen,
          [],
          passConfig.pingPong,
          passConfig.texture,
        )

        this.pipeline.add(
          passConfig.name,
          pass,
          passConfig.dependencies,
        )

        // Map this pass's texture to its name
        if (pass.texture) {
          this.textureMap.set(passConfig.name, pass.texture)
        }
      }
      catch (error: unknown) {
        console.error(`Error in pass ${passConfig.name}: ${(error as any).message}`)
      }
    })

    this.syncPassTextures()
  }

  public play(): void {
    if (this.animationRequestID !== -1 || typeof requestAnimationFrame === 'undefined') {
      this.paused = false
      return
    }

    this.paused = false
    this.animationRequestID = requestAnimationFrame(this.render.bind(this))
  }

  public resume(): void {
    this.play()
  }

  public pause(): void {
    if (this.paused) {
      return
    }

    this.paused = true
    this.pausedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this.cancelAnimationLoop()
  }

  public reset(): void {
    this.clear()
  }

  private renderFrame(currentTime?: number): void {
    this.updateTime(currentTime)
    this.resizeCanvasToDisplaySize()
    let presentedTexture: Texture | undefined

    this.pipeline.forEach((pass) => {
      this.syncPassTexturesForPass(pass)
      pass.use()
      this.updateUniforms(pass)
      pass.draw()
      this.updateTextureMapForPass(pass)

      const passConfig = this.passConfigs.get(pass.shader.passName)
      if (passConfig?.presentToCanvas) {
        presentedTexture = pass.texture
      }
    })

    if (presentedTexture) {
      this.presentTexture(presentedTexture)
    }
  }

  private syncPassTextures(): void {
    this.textureMap.clear()

    this.pipeline.forEach((pass) => {
      this.updateTextureMapForPass(pass)
    })

    this.pipeline.forEach((pass) => {
      this.syncPassTexturesForPass(pass)
    })
  }

  private syncPassTexturesForPass(pass: Pass): void {
    const passName = pass.shader.passName
    const passConfig = this.passConfigs.get(passName)
    if (!passConfig) {
      return
    }

    pass.textures = passConfig.textures.reduce<Texture[]>((textures, textureName) => {
      const texture = this.textureMap.get(textureName)
      if (!texture) {
        console.warn(`Texture ${textureName} not found for pass ${passName}`)
        return textures
      }

      textures.push(texture)
      return textures
    }, [])
  }

  private updateTextureMapForPass(pass: Pass): void {
    const texture = pass.texture
    if (!texture) {
      return
    }

    this.textureMap.set(pass.shader.passName, texture)
  }

  private presentTexture(texture: Texture): void {
    if (!texture.handle) {
      return
    }

    bindFramebufferInfo(this.gl, null)
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)

    this.presentShader.use()
    setBuffersAndAttributes(this.gl, this.presentShader.programInfo, this.screenTriangle)
    setUniforms(this.presentShader.programInfo, {
      u_texture0: texture.handle,
      u_resolution: [this.gl.canvas.width, this.gl.canvas.height],
    })
    drawBufferInfo(this.gl, this.screenTriangle)
  }

  private cancelAnimationLoop(): void {
    if (this.animationRequestID === -1 || typeof cancelAnimationFrame === 'undefined') {
      this.animationRequestID = -1
      return
    }

    cancelAnimationFrame(this.animationRequestID)
    this.animationRequestID = -1
  }

  private clearCanvas(): void {
    bindFramebufferInfo(this.gl, null)
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  private resetPlaybackState(): void {
    this.now = new Date()
    this.time = 0
    this.timeDelta = 0
    this.playbackTime = 0
    this.lastTime = 0
    this.frameRate = 0
    this.currentFrame = 0
    this.currentTime = 0
    this.startTime = 0
    this.pausedAt = 0
  }
}
