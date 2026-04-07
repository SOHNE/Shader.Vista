import type { ProgramInfo } from 'twgl.js'
import type { ShaderError } from '../types'
import { createProgramInfo, setUniforms } from 'twgl.js'

const ERROR_LOG_REGEX = /ERROR: 0:(\d+): (.*)(?=\n|$)/

/**
 * Compiles and manages a WebGL shader program using twgl.js.
 * Responsible for compiling, linking, and providing access to uniforms and attributes.
 */
export default class Shader {
  private gl: WebGLRenderingContext
  public programInfo: ProgramInfo
  private onError: (details: ShaderError) => void
  public readonly passName: string

  constructor(
    gl: WebGLRenderingContext,
    vertexSource: string | undefined,
    fragmentSource: string,
    onError: (details: ShaderError) => void,
    passName: string,
  ) {
    this.gl = gl
    this.onError = onError
    this.passName = passName

    const sources = [
      vertexSource || this.defaultVertexShader(),
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

  private defaultVertexShader(): string {
    return `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }`
  }
}
