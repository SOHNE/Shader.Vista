import type { TextureOptions } from './texture'

export const TEXTURE_CHANNEL_COUNT = 4

export type PassConfig = {
  name: string
  fragmentShader: string
  texture?: TextureOptions
  vertexShader?: string
  pingPong?: boolean
  textures: string[]
}

export type RendererConfig = {
  passes: PassConfig[]
}

export type RendererMetrics = {
  paused: boolean
  time: number
  frameRate: number
  width: number
  height: number
}
