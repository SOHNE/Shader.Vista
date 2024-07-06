export default class Shader {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private uniformLocations: { [name: string]: WebGLUniformLocation } = {};
  private onError: (details: {
    passName: string;
    coords: { line: number; message: string };
  }) => void;
  private passName: string;

  constructor(
    gl: WebGLRenderingContext,
    vertexSource: string | undefined,
    fragmentSource: string,
    onError: (details: {
      passName: string;
      coords: { line: number; message: string };
    }) => void,
    passName: string
  ) {
    this.gl = gl;
    this.onError = onError;
    this.passName = passName;

    let vertexShader: WebGLShader | undefined;
    vertexShader = this.compileShader(
      vertexSource || this.defaultVertexShader(),
      gl.VERTEX_SHADER
    );

    const fragmentShader = this.compileShader(
      fragmentSource,
      gl.FRAGMENT_SHADER
    );
    this.program = this.linkProgram(vertexShader, fragmentShader);
  }

  private compileShader(source: string, type: number): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const log = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      const coords = this.extractErrorCoords(log || '');
      this.onError({
        passName: this.passName,
        coords,
      });
      throw new Error(`Failed to compile shader: ${log}`);
    }

    return shader;
  }

  private extractErrorCoords(log: string): {
    line: number;
    message: string;
  } {
    const match = /ERROR: 0:(\d+): (.*?)(?=\n|$)/.exec(log);
    if (match) {
      return {
        line: parseInt(match[1], 10),
        message: match[2],
      };
    }
    return { line: 0, message: '' };
  }

  private linkProgram(
    vertexShader: WebGLShader | undefined,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = this.gl.createProgram();
    if (!program) throw new Error('Failed to create program');

    if (vertexShader) this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const log = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Failed to link program: ${log}`);
    }

    return program;
  }

  public use(): void {
    this.gl.useProgram(this.program);
  }

  public setUniform(name: string, type: string, ...values: any[]): void {
    if (!this.uniformLocations[name]) {
      this.uniformLocations[name] = this.gl.getUniformLocation(
        this.program,
        name
      ) as WebGLUniformLocation;
    }

    const location = this.uniformLocations[name];
    switch (type) {
      case '1f':
        this.gl.uniform1f(location, values[0]);
        break;
      case '1i':
        this.gl.uniform1i(location, values[0]);
        break;
      case '2fv':
        this.gl.uniform2fv(location, values[0]);
        break;
      case '3fv':
        this.gl.uniform3fv(location, values[0]);
        break;
      case '4fv':
        this.gl.uniform4fv(location, values[0]);
        break;
    }
  }

  public getAttribLocation(name: string): number {
    return this.gl.getAttribLocation(this.program, name);
  }

  private defaultVertexShader(): string {
    return `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }`;
  }
}

