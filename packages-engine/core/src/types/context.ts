import type { GLContextCapabilities } from './gl'

export type GLContextVersion = 1 | 2

export type RendererContext = Readonly<{
  capabilities: GLContextCapabilities
  webglVersion: GLContextVersion
}>
