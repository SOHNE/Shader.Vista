import webglUtils from "./glUtils";

export default class Texture {
  gl: WebGLRenderingContext;
  texture: WebGLTexture;

  constructor(
    gl: WebGLRenderingContext,
    url: string,
    isVideo: boolean = false
  ) {
    this.gl = gl;
    this.texture = isVideo
      ? webglUtils.loadVideoTexture(gl, document.createElement("video"))
      : webglUtils.loadImageTexture(gl, url);
  }

  bind(unit: number = 0) {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
}
