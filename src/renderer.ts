import Pass from './pass';
import Shader from './shader';

export interface PassConfig {
  name: string;
  fragmentShader: string;
  vertexShader?: string;
  offscreen?: boolean;
  textures: string[];
}

export interface RendererConfig {
  passes: PassConfig[];
  textures?: string[];
}

export default class WebGLRenderer {
  private gl: WebGLRenderingContext;
  private passes: Pass | null = null;
  private canvas: HTMLCanvasElement;
  private textureMap: { [key: string]: WebGLTexture } = {};
  private now: Date;

  public mouseX: number = 0;
  public mouseY: number = 0;
  public time: number = 0;
  public timeDelta: number = 0;
  public realToCSSPixels: number = window.devicePixelRatio || 1;
  public paused: boolean = false;
  public playbackTime: number = 0;
  public lastTime: number = 0;
  public frameRate: number = 0;
  public currentFrame: number = 0;
  public currentTime: number = 0;
  public startTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = this.initializeWebGLContext(canvas);
    this.initMouseEvents();
    window.addEventListener(
      'resize',
      this.resizeCanvasToDisplaySize.bind(this)
    );
    this.now = new Date();
    //requestAnimationFrame(this.render.bind(this));
  }

  private initializeWebGLContext(
    canvas: HTMLCanvasElement
  ): WebGLRenderingContext {
    const opts = {
      alpha: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    };

    const gl =
      canvas.getContext('webgl2', opts) ||
      canvas.getContext('experimental-webgl2', opts) ||
      canvas.getContext('webgl', opts) ||
      canvas.getContext('experimental-webgl', opts);

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    return gl as WebGLRenderingContext;
  }

  private initMouseEvents(): void {
    this.canvas.addEventListener('mousemove', this.setMousePosition.bind(this));
    this.canvas.addEventListener('touchstart', this.preventDefault, {
      passive: false,
    });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
    });
  }

  private setMousePosition(e: MouseEvent | Touch): void {
    const mouse = {
      x: e.clientX || e.pageX,
      y: e.clientY || e.pageY,
    };

    const rect = this.canvas.getBoundingClientRect();
    if (
      mouse.x >= rect.left &&
      mouse.x <= rect.right &&
      mouse.y >= rect.top &&
      mouse.y <= rect.bottom
    ) {
      this.mouseX = (mouse.x - rect.left) * this.realToCSSPixels;
      this.mouseY =
        this.canvas.height - (mouse.y - rect.top) * this.realToCSSPixels;
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.setMousePosition(e.touches[0]);
    }
  }

  private preventDefault(e: Event): void {
    e.preventDefault();
  }

  public addPass(pass: Pass): void {
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

  private resizeCanvasToDisplaySize(): void {
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
        current.resize(displayWidth, displayHeight);
        current = current.next;
      }
    }
  }

  private updateUniforms(pass: Pass): void {
    pass.shader.setUniform('u_date', '4fv', [
      this.now.getFullYear(),
      this.now.getMonth() + 1,
      this.now.getDate(),
      this.now.getHours() * 3600 +
        this.now.getMinutes() * 60 +
        this.now.getSeconds() +
        this.now.getMilliseconds() / 1000,
    ]);

    pass.shader.setUniform('u_frame', '1i', this.currentFrame);
    pass.shader.setUniform('u_time', '1f', this.currentTime);
    pass.shader.setUniform('u_timeDelta', '1f', this.timeDelta);
    pass.shader.setUniform('u_frameRate', '1f', this.frameRate);

    pass.shader.setUniform('u_resolution', '2fv', [pass.width, pass.height]);

    pass.shader.setUniform('u_mouse', '2fv', [this.mouseX, this.mouseY]);
  }

  private updateTime(currentTime: number): void {
    if (this.paused) {
      this.timeDelta = 0;
      return;
    }

    if (this.lastTime === 0) {
      this.lastTime = currentTime;
    }

    {
      const t = performance.now();
      this.timeDelta = (t - this.startTime) / 1000.0;
      this.currentTime += this.timeDelta;
      this.frameRate = 1.0 / this.timeDelta;
      this.currentFrame++;
      this.startTime = t;
    }
  }

  public render(currentTime: number): void {
    this.updateTime(currentTime);
    this.resizeCanvasToDisplaySize();

    let current = this.passes;
    while (current) {
      current.use();
      this.updateUniforms(current);
      current.draw();
      current = current.next;
    }

    //requestAnimationFrame(this.render.bind(this));
  }

  public setup(config: RendererConfig): void {
    const displayWidth = Math.floor(
      this.canvas.clientWidth * this.realToCSSPixels
    );
    const displayHeight = Math.floor(
      this.canvas.clientHeight * this.realToCSSPixels
    );

    config.passes.forEach((passConfig: PassConfig) => {
      try {
        const shader = new Shader(
          this.gl,
          passConfig.vertexShader,
          passConfig.fragmentShader
        );
        const offscreen =
          passConfig.offscreen || passConfig.name !== 'MainBuffer';
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

  public play(): void {
    this.paused = false;
    requestAnimationFrame(this.render.bind(this));
  }

  public pause(): void {
    this.paused = true;
  }

  public reset(): void {
    this.playbackTime = 0;
    this.currentFrame = 0;
    this.lastTime = 0;
    this.frameRate = 0;
  }
}
