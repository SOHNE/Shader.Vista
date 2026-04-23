import type { BufferInfo } from 'twgl.js'
import type Shader from '../shader/Shader'
import type { GL, GLContextCapabilities } from '../types/gl'
import type { TextureOptions } from '../types/texture'
import { bindFramebufferInfo, drawBufferInfo, setBuffersAndAttributes } from 'twgl.js'
import FBO from '../fbo/FBO'
import Texture from '../texture/Texture'

/**
 * Represents a render pass in the WebGL pipeline.
 */
export default class Pass {
  gl: GL
  shader: Shader
  width: number
  height: number
  offscreen: boolean
  pingPong: boolean
  textures: Array<Texture | undefined>
  bufferInfo: BufferInfo
  private fbos: FBO[]
  private readBufferIndex: number

  constructor(
    gl: GL,
    capabilities: GLContextCapabilities,
    shader: Shader,
    geometry: BufferInfo,
    width: number,
    height: number,
    offscreen = true,
    textures: Array<Texture | undefined> = [],
    pingPong = false,
    textureOptions: TextureOptions = {},
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
        this.fbos.push(new FBO(
          gl,
          capabilities,
          width,
          height,
          new Texture(shader.passName, textureOptions, undefined, capabilities),
        ))
      }
    }
  }

  get fbo(): FBO | null {
    return this.readFBO
  }

  get texture(): Texture | undefined {
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
    drawBufferInfo(this.gl, this.bufferInfo)

    if (this.pingPong) {
      this.swap()
    }

    this.texture?.generateMipmap(this.gl, this.width, this.height)
  }

  clear(): void {
    this.readBufferIndex = 0
    this.fbos.forEach(fbo => fbo.clear())
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
