import type { BufferInfo, FramebufferInfo } from 'twgl.js'
import type Shader from '../shader/Shader'
import { bindFramebufferInfo, createFramebufferInfo, drawBufferInfo, resizeFramebufferInfo, setBuffersAndAttributes, setUniforms } from 'twgl.js'

/**
 * Represents a render pass in the WebGL pipeline.
 */
export default class Pass {
  gl: WebGLRenderingContext
  shader: Shader
  width: number
  height: number
  fbi: FramebufferInfo | null
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
      this.fbi = createFramebufferInfo(gl, [
        { format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.NEAREST, mag: gl.NEAREST, wrap: gl.CLAMP_TO_EDGE },
      ], width, height)
    }
    else {
      this.fbi = null
    }
  }

  get texture(): WebGLTexture | undefined {
    return this.fbi?.attachments[0]
  }

  use() {
    this.shader.use()

    if (this.offscreen && this.fbi) {
      bindFramebufferInfo(this.gl, this.fbi)
    }
    else {
      bindFramebufferInfo(this.gl, null)
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    }
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
    if (this.offscreen && this.fbi) {
      resizeFramebufferInfo(this.gl, this.fbi, [
        { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE, min: this.gl.NEAREST, mag: this.gl.NEAREST, wrap: this.gl.CLAMP_TO_EDGE },
      ], width, height)
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
