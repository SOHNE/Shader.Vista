import type Texture from '../texture/Texture'

export type ShaderUniformMap = Record<string, unknown>

export type UniformContextTarget = 'pass' | 'present'

export type UniformContext = Readonly<{
  date: readonly [number, number, number, number]
  frame: number
  frameRate: number
  mouse: readonly [number, number]
  passName: string
  resolution: readonly [number, number]
  target: UniformContextTarget
  textures: readonly (Texture | undefined)[]
  time: number
  timeDelta: number
}>

export type UniformProvider = Readonly<{
  id: string
  resolve: (context: UniformContext) => ShaderUniformMap | undefined
}>
