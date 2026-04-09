import type { FramebufferInfo } from 'twgl.js'
import type Texture from '../texture/Texture'
import type { GL } from '../types/gl'
import { bindFramebufferInfo, createFramebufferInfo, resizeFramebufferInfo } from 'twgl.js'

/**
 * Wrapper around a WebGL framebuffer and its color attachment texture.
 */
export default class FBO {
  private gl: GL
  private framebufferInfo: FramebufferInfo

  public width: number
  public height: number
  public readonly texture: Texture

  constructor(gl: GL, width: number, height: number, texture: Texture) {
    this.gl = gl
    this.width = width
    this.height = height
    this.texture = texture
    this.framebufferInfo = this.create(width, height)
  }

  private create(width: number, height: number): FramebufferInfo {
    const framebufferInfo = createFramebufferInfo(
      this.gl,
      [this.texture.getFramebufferAttachmentOptions(this.gl)],
      width,
      height,
    )

    this.clear(framebufferInfo)
    this.texture.setHandle(framebufferInfo.attachments[0])
    this.texture.generateMipmap(this.gl, width, height)

    return framebufferInfo
  }

  get info(): FramebufferInfo {
    return this.framebufferInfo
  }

  public bind(): void {
    bindFramebufferInfo(this.gl, this.framebufferInfo)
  }

  public resize(width: number, height: number): void {
    this.width = width
    this.height = height
    resizeFramebufferInfo(
      this.gl,
      this.framebufferInfo,
      [this.texture.getFramebufferAttachmentOptions(this.gl)],
      width,
      height,
    )
    this.texture.setHandle(this.framebufferInfo.attachments[0])

    this.clear()
    this.texture.generateMipmap(this.gl, width, height)
  }

  public clear(framebufferInfo: FramebufferInfo = this.framebufferInfo): void {
    bindFramebufferInfo(this.gl, framebufferInfo)
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    bindFramebufferInfo(this.gl, null)
  }
}
