export type PassConfig = {
  name: string
  fragmentShader: string
  vertexShader?: string
  pingPong?: boolean
  textures: string[]
}

export type RendererConfig = {
  passes: PassConfig[]
}
