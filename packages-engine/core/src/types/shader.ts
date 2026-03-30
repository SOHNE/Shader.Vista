export type ShaderError = {
  passName: string
  coords: { line: number, message: string }
}

export type UniformType = '1f' | '1i' | '2fv' | '3fv' | '4fv'
