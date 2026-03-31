import type { BufferInfo, FramebufferInfo } from 'twgl.js'
import type Shader from '../shader/Shader'
import * as twgl from 'twgl.js'

/**
 * Represents a render pass in the WebGL pipeline using twgl.js.
 * Responsible for managing framebuffer, texture, and draw calls for a single pass.
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
    width: number,
    height: number,
    offscreen = true,
    textures: WebGLTexture[] = [],
  ) {
    this.gl = gl
    this.shader = shader
    this.width = width
    this.height = height
    this.offscreen = offscreen
    this.textures = textures
    this.next = null

    if (this.offscreen) {
      this.fbi = twgl.createFramebufferInfo(gl, [
        { format: gl.RGBA, type: gl.UNSIGNED_BYTE, min: gl.NEAREST, mag: gl.NEAREST, wrap: gl.CLAMP_TO_EDGE },
      ], width, height)
    }
    else {
      this.fbi = null
    }

    const arrays = {
      a_position: {
        numComponents: 2,
        data: [
          -1,
          -1,
          1,
          -1,
          -1,
          1,
          -1,
          1,
          1,
          -1,
          1,
          1,
        ],
      },
    }
    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)
  }

  get texture(): WebGLTexture | undefined {
    return this.fbi?.attachments[0]
  }

  use() {
    this.shader.use()

    if (this.offscreen && this.fbi) {
      twgl.bindFramebufferInfo(this.gl, this.fbi)
    }
    else {
      twgl.bindFramebufferInfo(this.gl, null)
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    }
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
    if (this.offscreen && this.fbi) {
      twgl.resizeFramebufferInfo(this.gl, this.fbi, [
        { format: this.gl.RGBA, type: this.gl.UNSIGNED_BYTE, min: this.gl.NEAREST, mag: this.gl.NEAREST, wrap: this.gl.CLAMP_TO_EDGE },
      ], width, height)
    }
  }

  draw() {
    twgl.setBuffersAndAttributes(this.gl, this.shader.programInfo, this.bufferInfo)

    const uniforms: { [key: string]: any } = {}
    this.textures.forEach((texture, index) => {
      uniforms[`u_texture${index}`] = texture
    })

    twgl.setUniforms(this.shader.programInfo, uniforms)
    twgl.drawBufferInfo(this.gl, this.bufferInfo)
  }
}
