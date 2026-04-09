import type { TextureOptions } from './texture'

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
