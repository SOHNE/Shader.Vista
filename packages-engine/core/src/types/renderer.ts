export type PassConfig = {
  name: string
  fragmentShader: string
  vertexShader?: string
  offscreen?: boolean
  textures: string[]
}

export type RendererConfig = {
  passes: PassConfig[]
}
