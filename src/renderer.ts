import Pass from "./pass";
import Shader from "./shader";

export default class WebGLRenderer {
  gl: WebGLRenderingContext;
  passes: Pass | null;
  canvas: HTMLCanvasElement;
  mouseX: number;
  mouseY: number;
  timeDelta: number;
  lastTime: number;
  realToCSSPixels: number;
  paused: boolean;
  resetTime: boolean;
  accumulatedTime: number;
  pauseStartTime: number;
  totalPauseDuration: number;
  textureMap: { [key: string]: WebGLTexture };

  constructor(canvas: HTMLCanvasElement) {
    console.log("Constructor");
    this.canvas = canvas;
    const opts = {
      alpha: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    };
    let gl: RenderingContext | null = null;
    if (gl === null) gl = canvas.getContext("webgl2", opts);
    if (gl === null) gl = canvas.getContext("experimental-webgl2", opts);
    if (gl === null) gl = canvas.getContext("webgl", opts);
    if (gl === null) gl = canvas.getContext("experimental-webgl", opts);

    if (!gl) {
      throw new Error("WebGL not supported");
    }

    this.gl = <WebGLRenderingContext>gl;
    this.passes = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.timeDelta = 0;
    this.lastTime = 0;
    this.realToCSSPixels = window.devicePixelRatio || 1;
    this.paused = false;
    this.resetTime = false;
    this.accumulatedTime = 0;
    this.pauseStartTime = 0;
    this.totalPauseDuration = 0;
    this.textureMap = {};

    this.initMouseEvents();
    window.addEventListener('resize', this.resizeCanvasToDisplaySize.bind(this));
  }

  initMouseEvents() {
    this.canvas.addEventListener("mousemove", this.setMousePosition.bind(this));
    this.canvas.addEventListener("touchstart", this.preventDefault, {
      passive: false,
    });
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: false,
    });
  }

  setMousePosition(e: MouseEvent | Touch) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = rect.height - (e.clientY - rect.top) - 1;
  }

  handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.setMousePosition(e.touches[0]);
    }
  }

  preventDefault(e: Event) {
    e.preventDefault();
  }

  addPass(pass: Pass) {
    if (this.passes) {
      let current = this.passes;
      while (current.next) {
        current = current.next;
      }
      current.next = pass;
    } else {
      this.passes = pass;
    }
  }

  resizeCanvasToDisplaySize() {
    const displayWidth = Math.floor(
      this.canvas.clientWidth * this.realToCSSPixels
    );
    const displayHeight = Math.floor(
      this.canvas.clientHeight * this.realToCSSPixels
    );

    if (
      this.canvas.width !== displayWidth ||
      this.canvas.height !== displayHeight
    ) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;

      let current = this.passes;
      while (current) {
        current.width = displayWidth;
        current.height = displayHeight;

        if (current.offscreen) {
          this.gl.bindTexture(this.gl.TEXTURE_2D, current.texture);
          this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            displayWidth,
            displayHeight,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            null
          );
        }

        current = current.next;
      }
    }
  }

  render = (time: number) => {
    time *= 0.001; // convert to seconds

    if (this.resetTime) {
      this.lastTime = time;
      this.accumulatedTime = 0;
      this.resetTime = false;
      this.totalPauseDuration = 0;
    } else if (this.paused) {
      this.pauseStartTime = time;
    } else {
      if (this.pauseStartTime) {
        this.totalPauseDuration += time - this.pauseStartTime;
        this.pauseStartTime = 0;
      }
      this.timeDelta = time - this.lastTime;
      this.lastTime = time;
      this.accumulatedTime += this.timeDelta;
    }

    this.resizeCanvasToDisplaySize();

    let current = this.passes;
    while (current) {
      current.use();

      const positionAttributeLocation =
        current.shader.getAttribLocation("a_position");
      const resolutionLocation =
        current.shader.getUniformLocation("u_resolution");
      const mouseLocation = current.shader.getUniformLocation("u_mouse");
      const timeLocation = current.shader.getUniformLocation("u_time");
      const timeDeltaLocation =
        current.shader.getUniformLocation("u_timeDelta");

      const positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        this.gl.STATIC_DRAW
      );

      this.gl.enableVertexAttribArray(positionAttributeLocation);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      this.gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );

      this.gl.uniform2f(
        resolutionLocation,
        this.gl.canvas.width,
        this.gl.canvas.height
      );

      if (mouseLocation !== -1) {
        this.gl.uniform2f(mouseLocation, this.mouseX, this.mouseY);
      }

      if (timeLocation !== -1) {
        this.gl.uniform1f(
          timeLocation,
          this.accumulatedTime - this.totalPauseDuration
        );
      }

      if (timeDeltaLocation !== -1) {
        this.gl.uniform1f(timeDeltaLocation, this.timeDelta);
      }

      // Bind multiple textures
      current.textures.forEach((texture, index) => {
        if (current) {
          const textureLocation = current.shader.getUniformLocation(
            `u_texture${index}`
          );
          if (textureLocation !== -1) {
            this.gl.activeTexture(
              this.gl.TEXTURE0 + index
              // [`TEXTURE${index}` as keyof WebGLRenderingContext]
            );
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.uniform1i(textureLocation, index);
          }
        }
      });

      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

      current = current.next;
    }
  };

  setup(config: any) {
    console.log("Setup");

    const displayWidth = Math.floor(
      this.canvas.clientWidth * this.realToCSSPixels
    );
    const displayHeight = Math.floor(
      this.canvas.clientHeight * this.realToCSSPixels
    );

    config.passes.forEach((passConfig: any) => {
      try {
        const shader = new Shader(
          this.gl,
          passConfig.vertexShader,
          passConfig.fragmentShader
        );
        const offscreen = passConfig.name !== "MainBuffer";
        const pass = new Pass(
          this.gl,
          shader,
          displayWidth,
          displayHeight,
          offscreen,
          passConfig.textures.map(
            (textureName: string) => this.textureMap[textureName]
          )
        );
        this.addPass(pass);

        // Map this pass's texture to its name
        this.textureMap[passConfig.name] = pass.texture;
      } catch (error) {
        //@ts-ignore
        console.error(`Error in pass ${passConfig.name}: ${error.message}`);
      }
    });
  }

  play() {
    if (this.paused) {
      this.paused = false;
      this.totalPauseDuration +=
        performance.now() * 0.001 - this.pauseStartTime;
      this.pauseStartTime = 0;
    }
  }

  pause() {
    if (!this.paused) {
      this.paused = true;
      this.pauseStartTime = performance.now() * 0.001;
    }
  }

  reset() {
    this.resetTime = true;
    this.accumulatedTime = 0;
    this.totalPauseDuration = 0;
    this.pauseStartTime = 0;
  }
}
