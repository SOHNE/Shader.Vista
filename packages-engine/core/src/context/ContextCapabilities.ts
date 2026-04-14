import type { GL, GLContextCapabilities } from '../types/gl'

export function isWebGL2Context(gl: GL): gl is WebGL2RenderingContext {
  return (
    (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext)
    || typeof (gl as WebGL2RenderingContext).texStorage2D === 'function'
  )
}

export function detectGLContextCapabilities(gl: GL): GLContextCapabilities {
  const isWebGL2 = isWebGL2Context(gl)

  return Object.freeze({
    isWebGL2,
    supportsFloatTexture: isWebGL2 || gl.getExtension('OES_texture_float') !== null,
    supportsFloatColorBuffer: isWebGL2
      ? gl.getExtension('EXT_color_buffer_float') !== null
      : gl.getExtension('WEBGL_color_buffer_float') !== null,
    supportsFloatTextureLinear: gl.getExtension('OES_texture_float_linear') !== null,
  })
}
