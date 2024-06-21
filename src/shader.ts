export default class Shader {
  gl: WebGLRenderingContext;
  program: WebGLProgram;

  constructor(
    gl: WebGLRenderingContext,
    vertexSource: string,
    fragmentSource: string
  ) {
    this.gl = gl;
    const vertexShader = <WebGLShader>(
      this.compileShader(
        this.gl.VERTEX_SHADER,
        vertexSource || this.defaultVertexShader()
      )
    );
    const fragmentShader = <WebGLShader>(
      this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource)
    );
    this.program = <WebGLProgram>this.linkProgram(vertexShader, fragmentShader);
  }

  defaultVertexShader() {
    return `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `;
  }

  compileShader(type: number, source: string) {
    const shader = <WebGLShader>this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Could not compile shader: ${info}`);
    }
    return shader;
  }

  linkProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = <WebGLProgram>this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Could not link program: ${info}`);
    }
    return program;
  }

  use() {
    this.gl.useProgram(this.program);
  }

  getAttribLocation(name: string) {
    return this.gl.getAttribLocation(this.program, name);
  }

  getUniformLocation(name: string) {
    return this.gl.getUniformLocation(this.program, name);
  }
}
