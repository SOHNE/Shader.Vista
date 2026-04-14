export type GL = WebGLRenderingContext | WebGL2RenderingContext

export type GLContextCapabilities = Readonly<{
  isWebGL2: boolean
  supportsFloatColorBuffer: boolean
  supportsFloatTexture: boolean
  supportsFloatTextureLinear: boolean
}>
