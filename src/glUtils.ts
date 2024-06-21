const webglUtils = {
  createShader: (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  },
  createProgram: (
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) => {
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  },
  createProgramFromSources: (
    gl: WebGLRenderingContext,
    shaderSources: [string, string]
  ): WebGLProgram => {
    const vertexShader = <WebGLShader>(
      webglUtils.createShader(gl, gl.VERTEX_SHADER, shaderSources[0])
    );
    const fragmentShader = <WebGLShader>(
      webglUtils.createShader(gl, gl.FRAGMENT_SHADER, shaderSources[1])
    );
    return <WebGLProgram>(
      webglUtils.createProgram(gl, vertexShader, fragmentShader)
    );
  },
  resizeCanvasToDisplaySize: (canvas: HTMLCanvasElement | OffscreenCanvas) => {
    const displayWidth = canvas.width;
    const displayHeight = canvas.height;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
  },
  loadImageTexture: (gl: WebGLRenderingContext, url: string): WebGLTexture => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255])
    );

    const image = new Image();
    image.src = url;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    };
    return <WebGLTexture>texture;
  },
  loadVideoTexture: (
    gl: WebGLRenderingContext,
    video: HTMLVideoElement
  ): WebGLTexture => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255])
    );

    video.addEventListener("play", () => {
      updateTexture();
    });

    function updateTexture() {
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
      if (!video.paused && !video.ended) {
        requestAnimationFrame(updateTexture);
      }
    }
    return <WebGLTexture>texture;
  },
};

function isPowerOf2(value: number) {
  return (value & (value - 1)) === 0;
}

export default webglUtils;
