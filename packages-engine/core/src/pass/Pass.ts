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
  fbo: FBO | null
  next: Pass | null
  offscreen: boolean
  textures: WebGLTexture[]
  bufferInfo: BufferInfo

  constructor(
    gl: WebGLRenderingContext,
    shader: Shader,
    geometry: BufferInfo,
    width: number,
    height: number,
    offscreen = true,
    textures: WebGLTexture[] = [],
  ) {
    this.gl = gl
    this.shader = shader
    this.bufferInfo = geometry
    this.width = width
    this.height = height
    this.offscreen = offscreen
    this.textures = textures
    this.next = null

    if (this.offscreen) {
      this.fbo = new FBO(gl, width, height)
    }
    else {
      this.fbo = null
    }
  }

  get texture(): WebGLTexture | undefined {
    return this.fbo?.texture
  }

  use() {
    this.shader.use()

    if (this.offscreen && this.fbo) {
      this.fbo.bind()
    }
    else {
      bindFramebufferInfo(this.gl, null)
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    }
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
    if (this.offscreen && this.fbo) {
      this.fbo.resize(width, height)
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
  }
}
