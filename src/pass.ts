import Shader from './shader';

export default class Pass {
  gl: WebGLRenderingContext;
  shader: Shader;
  width: number;
  height: number;
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  next: Pass | null;
  offscreen: boolean;
  textures: WebGLTexture[];
  positionBuffer: WebGLBuffer;
  positionAttributeLocation: number;

  constructor(
    gl: WebGLRenderingContext,
    shader: Shader,
    width: number,
    height: number,
    offscreen = true,
    textures: WebGLTexture[] = []
  ) {
    this.gl = gl;
    this.shader = shader;
    this.width = width;
    this.height = height;
    this.texture = this.createTexture() as WebGLTexture;
    this.framebuffer = this.createFramebuffer(this.texture) as WebGLFramebuffer;
    this.next = null;
    this.offscreen = offscreen;
    this.textures = textures;
    this.positionAttributeLocation =
      this.shader.getAttribLocation('a_position');
    this.positionBuffer = this.createPositionBuffer() as WebGLBuffer;
  }

  use() {
    this.shader.use();

    if (this.offscreen) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
      this.gl.viewport(0, 0, this.width, this.height);
    } else {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (this.offscreen) {
      this.texture = this.createTexture() as WebGLTexture;
      this.framebuffer = this.createFramebuffer(
        this.texture
      ) as WebGLFramebuffer;
    }
  }

  draw() {
    const positions = new Float32Array([
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    ]);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.gl.vertexAttribPointer(
      this.positionAttributeLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.textures.forEach((texture, index) => {
      this.gl.activeTexture(this.gl.TEXTURE0 + index);;
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.shader.setUniform(`u_texture${index}`, '1i', index);
    });

    this.gl.drawArrays(this.gl.TRIANGLES, 0, positions.length / 2);
  }

  private createTexture() {
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.NEAREST
    );
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.width,
      this.height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      null
    );
    return texture;
  }

  private createFramebuffer(texture: WebGLTexture) {
    const framebuffer = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      texture,
      0
    );
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    return framebuffer;
  }

  private createPositionBuffer() {
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    return buffer;
  }
}

