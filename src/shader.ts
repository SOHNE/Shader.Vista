export default class Shader {
  gl: WebGLRenderingContext;
  program: WebGLProgram;

  constructor(
    gl: WebGLRenderingContext,
    vertexSource: string | undefined,
    fragmentSource: string
  ) {
    this.gl = gl;

    // Ensure default vertex shader is used if not provided
    vertexSource = vertexSource || this.defaultVertexShader();

    //console.log('Vertex Shader Source:', vertexSource);
    //console.log('Fragment Shader Source:', fragmentSource);

    const vertexShader = this.compileShader(
      this.gl.VERTEX_SHADER,
      vertexSource
    );
    const fragmentShader = this.compileShader(
      this.gl.FRAGMENT_SHADER,
      fragmentSource
    );

    this.program = this.linkProgram(vertexShader, fragmentShader);
  }

  private compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type) as WebGLShader;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      console.error(`Could not compile shader: ${info}`);
      console.error(`Shader source:\n${source}`);
      this.gl.deleteShader(shader);
      throw new Error(`Could not compile shader: ${info}`);
    }
    return shader;
  }

  private linkProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = this.gl.createProgram() as WebGLProgram;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      console.error(`Could not link program: ${info}`);
      this.gl.deleteProgram(program);
      throw new Error(`Could not link program: ${info}`);
    }
    return program;
  }

  use() {
    this.gl.useProgram(this.program);
  }

  getAttribLocation(name: string): number {
    return this.gl.getAttribLocation(this.program, name);
  }

  getUniformLocation(name: string): WebGLUniformLocation | null {
    return this.gl.getUniformLocation(this.program, name);
  }

  setUniform(name: string, type: string, value: any) {
    const location = this.getUniformLocation(name);
    if (location === null) {
      //console.warn(`Uniform '${name}' not found in shader program.`);
      return;
    }

    switch (type) {
      case '1i':
        this.gl.uniform1i(location, value);
        break;
      case '1f':
        this.gl.uniform1f(location, value);
        break;
      case '2fv':
        this.gl.uniform2fv(location, value);
        break;
      case '3fv':
        this.gl.uniform3fv(location, value);
        break;
      case '4fv':
        this.gl.uniform4fv(location, value);
        break;
      default:
        throw new Error(`Unknown uniform type: ${type}`);
    }
  }

  private defaultVertexShader(): string {
    return `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `;
  }
}
