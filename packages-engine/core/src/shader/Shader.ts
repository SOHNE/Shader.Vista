import type { ProgramInfo } from 'twgl.js'
import type { ShaderError } from '../types'
import type { GL, GLContextCapabilities } from '../types/gl'
import { createProgramInfo, setUniforms } from 'twgl.js'

const ERROR_LOG_REGEX = /ERROR: 0:(\d+): (.*)(?=\n|$)/
const GLSL_300_ES_REGEX = /^\s*#version\s+300\s+es\b/m
const DEFAULT_VERTEX_SHADER_GLSL100 = `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }`
const DEFAULT_VERTEX_SHADER_GLSL300ES = `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}`

/**
 * Compiles and manages a WebGL shader program using twgl.js.
 * Responsible for compiling, linking, and providing access to uniforms and attributes.
 */
export default class Shader {
  private gl: GL
  private readonly capabilities: GLContextCapabilities
  public programInfo: ProgramInfo
  private onError: (details: ShaderError) => void
  public readonly passName: string

  constructor(
    gl: GL,
    capabilities: GLContextCapabilities,
    vertexSource: string | undefined,
    fragmentSource: string,
    onError: (details: ShaderError) => void,
    passName: string,
  ) {
    this.capabilities = capabilities
    this.gl = gl
    this.onError = onError
    this.passName = passName

    const sources = [
      vertexSource || this.defaultVertexShader(fragmentSource),
      fragmentSource,
    ]

    const programInfo = createProgramInfo(this.gl, sources, (msg) => {
      const coords = this.extractErrorCoords(msg)
      this.onError({
        passName: this.passName,
        coords,
      })
    })

    if (!programInfo) {
      throw new Error(`Failed to create program for pass ${passName}`)
    }

    this.programInfo = programInfo
  }

  private extractErrorCoords(log: string): { line: number, message: string } {
    const match = ERROR_LOG_REGEX.exec(log)
    if (match) {
      return {
        line: Number.parseInt(match[1], 10),
        message: match[2],
      }
    }
    return { line: 0, message: log }
  }

  public use(): void {
    this.gl.useProgram(this.programInfo.program)
  }

  public setUniforms(uniforms: { [key: string]: any }): void {
    setUniforms(this.programInfo, uniforms)
  }

  public getAttribLocation(name: string): number {
    return this.gl.getAttribLocation(this.programInfo.program, name)
  }

  private defaultVertexShader(fragmentSource: string): string {
    if (GLSL_300_ES_REGEX.test(fragmentSource)) {
      if (!this.capabilities.isWebGL2) {
        throw new Error(`Pass "${this.passName}" requires WebGL2 for GLSL ES 3.00 shaders`)
      }

      return DEFAULT_VERTEX_SHADER_GLSL300ES
    }

    return DEFAULT_VERTEX_SHADER_GLSL100
  }
}
