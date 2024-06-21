import Shader from "./shader";

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
    this.texture = <WebGLTexture>this.createTexture();
    this.framebuffer = <WebGLFramebuffer>this.createFramebuffer(this.texture);
    this.next = null;
    this.offscreen = offscreen;
    this.textures = textures;
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
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  createTexture() {
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
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
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR
    );
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
    return texture;
  }

  createFramebuffer(texture: WebGLTexture) {
    const framebuffer = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      texture,
      0
    );
    const status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    if (status !== this.gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Framebuffer not complete: ${status.toString()}`);
    }
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    return framebuffer;
  }
}
