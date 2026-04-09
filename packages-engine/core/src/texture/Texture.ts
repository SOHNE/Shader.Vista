import type { GL } from '../types/gl'
import type { TextureOptions } from '../types/texture'
import type { TextureFramebufferAttachmentOptions } from './TextureParameters'
import { setTextureFilteringForSize, setTextureParameters } from 'twgl.js'
import {
  getTextureFramebufferAttachmentOptions,
  shouldUpdateTextureFiltering,
} from './TextureParameters'

/**
 * Minimal named wrapper around a WebGL texture handle.
 * Used internally for pass outputs and texture bindings.
 */
export default class Texture {
  public readonly name: string
  private readonly options: Readonly<TextureOptions>
  private handleValue: WebGLTexture | undefined

  constructor(name: string, options: TextureOptions = {}, handle?: WebGLTexture) {
    this.name = name
    this.options = Object.freeze({ ...options })
    this.handleValue = handle
  }

  get handle(): WebGLTexture | undefined {
    return this.handleValue
  }

  public applyParameters(gl: GL): void {
    if (!this.handleValue) {
      return
    }

    setTextureParameters(gl, this.handleValue, this.getFramebufferAttachmentOptions(gl))
  }

  public generateMipmap(
    gl: GL,
    width: number,
    height: number,
  ): boolean {
    if (!this.handleValue || !shouldUpdateTextureFiltering(this.options)) {
      return false
    }

    const options = this.getFramebufferAttachmentOptions(gl)
    setTextureFilteringForSize(
      gl,
      this.handleValue,
      options,
      width,
      height,
      options.internalFormat ?? options.format ?? gl.RGBA,
    )
    return true
  }

  public getFramebufferAttachmentOptions(
    gl: GL,
  ): TextureFramebufferAttachmentOptions {
    return getTextureFramebufferAttachmentOptions(gl, this.options)
  }

  public setHandle(handle?: WebGLTexture): this {
    this.handleValue = handle
    return this
  }
}
