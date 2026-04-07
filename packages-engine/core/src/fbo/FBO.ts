import type { FramebufferInfo } from 'twgl.js'
import { bindFramebufferInfo, createFramebufferInfo, resizeFramebufferInfo } from 'twgl.js'

/**
 * Wrapper around a WebGL framebuffer and its color attachment texture.
 */
export default class FBO {
  private gl: WebGLRenderingContext
  private framebufferInfo: FramebufferInfo

  public width: number
  public height: number

  constructor(gl: WebGLRenderingContext, width: number, height: number) {
    this.gl = gl
    this.width = width
    this.height = height
    this.framebufferInfo = this.create(width, height)
  }

  private create(width: number, height: number): FramebufferInfo {
    return createFramebufferInfo(this.gl, [
      {
        format: this.gl.RGBA,
        type: this.gl.UNSIGNED_BYTE,
        min: this.gl.NEAREST,
        mag: this.gl.NEAREST,
        wrap: this.gl.CLAMP_TO_EDGE,
      },
    ], width, height)
  }

  get info(): FramebufferInfo {
    return this.framebufferInfo
  }

  get texture(): WebGLTexture | undefined {
    return this.framebufferInfo.attachments[0]
  }

  public bind(): void {
    bindFramebufferInfo(this.gl, this.framebufferInfo)
  }

  public resize(width: number, height: number): void {
    this.width = width
    this.height = height
    resizeFramebufferInfo(this.gl, this.framebufferInfo, [
      {
        format: this.gl.RGBA,
        type: this.gl.UNSIGNED_BYTE,
        min: this.gl.NEAREST,
        mag: this.gl.NEAREST,
        wrap: this.gl.CLAMP_TO_EDGE,
      },
    ], width, height)
  }
}
