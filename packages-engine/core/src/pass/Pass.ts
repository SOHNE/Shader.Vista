import type { BufferInfo } from 'twgl.js'
import type Shader from '../shader/Shader'
import { bindFramebufferInfo, drawBufferInfo, setBuffersAndAttributes, setUniforms } from 'twgl.js'
import FBO from '../fbo/FBO'

/**
 * Represents a render pass in the WebGL pipeline.
 */
export default class Pass {
  gl: WebGLRenderingContext
  shader: Shader
  width: number
  height: number
  offscreen: boolean
  pingPong: boolean
  textures: WebGLTexture[]
  bufferInfo: BufferInfo
  private fbos: FBO[]
  private readBufferIndex: number

  constructor(
    gl: WebGLRenderingContext,
    shader: Shader,
    geometry: BufferInfo,
    width: number,
    height: number,
    offscreen = true,
    textures: WebGLTexture[] = [],
    pingPong = false,
  ) {
    this.gl = gl
    this.shader = shader
    this.bufferInfo = geometry
    this.width = width
    this.height = height
    this.offscreen = offscreen
    this.pingPong = offscreen && pingPong
    this.textures = textures
    this.fbos = []
    this.readBufferIndex = 0

    if (this.offscreen) {
      const framebufferCount = this.pingPong ? 2 : 1
      for (let index = 0; index < framebufferCount; index++) {
        this.fbos.push(new FBO(gl, width, height))
      }
    }
  }

  get fbo(): FBO | null {
    return this.readFBO
  }

  get texture(): WebGLTexture | undefined {
    return this.readFBO?.texture
  }

  use() {
    this.shader.use()

    if (this.offscreen && this.writeFBO) {
      this.writeFBO.bind()
    }
    else {
      bindFramebufferInfo(this.gl, null)
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    }
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
    if (this.offscreen) {
      this.fbos.forEach(fbo => fbo.resize(width, height))
    }
  }

  draw() {
    setBuffersAndAttributes(this.gl, this.shader.programInfo, this.bufferInfo)

    const uniforms: { [key: string]: any } = {}
    this.textures.forEach((texture, index) => {
      uniforms[`u_texture${index}`] = texture
    })

    setUniforms(this.shader.programInfo, uniforms)
    drawBufferInfo(this.gl, this.bufferInfo)

    if (this.pingPong) {
      this.swap()
    }
  }

  private get readFBO(): FBO | null {
    return this.fbos[this.readBufferIndex] ?? null
  }

  private get writeFBO(): FBO | null {
    if (!this.offscreen) {
      return null
    }

    if (!this.pingPong) {
      return this.readFBO
    }

    return this.fbos[(this.readBufferIndex + 1) % this.fbos.length] ?? null
  }

  private swap(): void {
    this.readBufferIndex = (this.readBufferIndex + 1) % this.fbos.length
  }
}
