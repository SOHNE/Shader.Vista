import type { FramebufferInfo } from 'twgl.js'
import type Texture from '../texture/Texture'
import type { TextureFramebufferAttachmentOptions } from '../texture/TextureParameters'
import type { GL, GLContextCapabilities } from '../types/gl'
import { bindFramebufferInfo, createFramebufferInfo, resizeFramebufferInfo } from 'twgl.js'
import { assertFramebufferAttachmentSupport } from './FramebufferAttachmentSupport'

/**
 * Wrapper around a WebGL framebuffer and its color attachment texture.
 */
export default class FBO {
  private gl: GL
  private readonly capabilities: GLContextCapabilities
  private framebufferInfo: FramebufferInfo

  public width: number
  public height: number
  public readonly texture: Texture

  constructor(
    gl: GL,
    capabilities: GLContextCapabilities,
    width: number,
    height: number,
    texture: Texture,
  ) {
    this.gl = gl
    this.capabilities = capabilities
    this.width = width
    this.height = height
    this.texture = texture
    this.framebufferInfo = this.create(width, height)
  }

  private create(width: number, height: number): FramebufferInfo {
    const attachmentOptions = this.getAttachmentOptions()
    this.ensureAttachmentSupport(attachmentOptions)

    const framebufferInfo = createFramebufferInfo(
      this.gl,
      [attachmentOptions],
      width,
      height,
    )

    this.assertFramebufferComplete(framebufferInfo)
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
    const attachmentOptions = this.getAttachmentOptions()
    this.ensureAttachmentSupport(attachmentOptions)

    resizeFramebufferInfo(
      this.gl,
      this.framebufferInfo,
      [attachmentOptions],
      width,
      height,
    )
    this.assertFramebufferComplete(this.framebufferInfo)
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

  private getAttachmentOptions(): TextureFramebufferAttachmentOptions {
    return this.texture.getFramebufferAttachmentOptions(this.gl)
  }

  private ensureAttachmentSupport(attachmentOptions: TextureFramebufferAttachmentOptions): void {
    assertFramebufferAttachmentSupport(this.gl, this.capabilities, attachmentOptions)
  }

  private assertFramebufferComplete(framebufferInfo: FramebufferInfo): void {
    bindFramebufferInfo(this.gl, framebufferInfo)
    const status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER)
    bindFramebufferInfo(this.gl, null)

    if (status !== this.gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`FBO incomplete: 0x${status.toString(16)}`)
    }
  }
}
