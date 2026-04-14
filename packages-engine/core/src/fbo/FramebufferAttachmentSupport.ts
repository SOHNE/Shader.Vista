import type { AttachmentOptions } from 'twgl.js'
import type { GL, GLContextCapabilities } from '../types/gl'

export function resolveFramebufferAttachmentOptions(
  gl: GL,
  capabilities: GLContextCapabilities,
  options: Readonly<AttachmentOptions>,
): AttachmentOptions {
  if (!isFloatFramebufferAttachment(gl, options)) {
    return { ...options }
  }

  const nextOptions: AttachmentOptions = { ...options }

  if (
    capabilities.isWebGL2
    && nextOptions.internalFormat === undefined
    && (nextOptions.format === undefined || nextOptions.format === gl.RGBA)
  ) {
    nextOptions.internalFormat = (gl as WebGL2RenderingContextBase).RGBA32F
  }

  if (
    nextOptions.min === undefined
    && nextOptions.mag === undefined
    && nextOptions.minMag === undefined
  ) {
    nextOptions.min = gl.NEAREST
    nextOptions.mag = gl.NEAREST
  }

  if (
    nextOptions.wrap === undefined
    && nextOptions.wrapS === undefined
    && nextOptions.wrapT === undefined
  ) {
    nextOptions.wrapS = gl.CLAMP_TO_EDGE
    nextOptions.wrapT = gl.CLAMP_TO_EDGE
  }

  return nextOptions
}

export function assertFramebufferAttachmentSupport(
  gl: GL,
  capabilities: GLContextCapabilities,
  options: Readonly<AttachmentOptions>,
): void {
  if (!isFloatFramebufferAttachment(gl, options)) {
    return
  }

  if (!capabilities.supportsFloatTexture) {
    throw new Error('OES_texture_float not supported')
  }

  if (!capabilities.supportsFloatColorBuffer) {
    throw new Error(
      capabilities.isWebGL2
        ? 'EXT_color_buffer_float not supported'
        : 'WEBGL_color_buffer_float not supported',
    )
  }

  if (usesLinearFiltering(gl, options) && !capabilities.supportsFloatTextureLinear) {
    throw new Error('OES_texture_float_linear not supported')
  }
}

function isFloatFramebufferAttachment(gl: GL, options: Readonly<AttachmentOptions>): boolean {
  return options.attachment === undefined
    && options.type === gl.FLOAT
    && options.samples === undefined
}

function usesLinearFiltering(gl: GL, options: Readonly<AttachmentOptions>): boolean {
  return isLinearFilter(gl, options.min) || isLinearFilter(gl, options.mag) || isLinearFilter(gl, options.minMag)
}

function isLinearFilter(gl: GL, filter: number | undefined): boolean {
  return filter === gl.LINEAR
    || filter === gl.LINEAR_MIPMAP_NEAREST
    || filter === gl.NEAREST_MIPMAP_LINEAR
    || filter === gl.LINEAR_MIPMAP_LINEAR
}
