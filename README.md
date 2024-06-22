
# SOHNE | Shader.Vista

[![NPM version][npm-image]][npm-url]
[![PR Welcome][npm-downloads-image]][npm-downloads-url]

`Shader.Vista` is a lightweight WebGL rendering library designed to make it easy to work with WebGL fragment shaders, passes, and textures. It integrates seamlessly with React for modern web development.

## Features

- Simple API for setting up WebGL rendering contexts
- Support for multiple rendering passes and shaders
- Integration with React for easy use in web applications

## Installation

You can install `Shader.Vista` via npm:

```bash
npm install @sohne/shader.vista
```

or via yarn:

```bash
yarn add @sohne/shader.vista
```

## Usage

### Basic Usage

Here’s a simple example to get you started:

```typescript
import React, { useRef, useEffect } from 'react';
import WebGLRenderer from '@sohne/shader.vista';

// Main React functional component
const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);  // Reference to the canvas element
  const rendererRef = useRef<WebGLRenderer>();  // Reference to the WebGL renderer

  useEffect(() => {
    rendererRef.current = new WebGLRenderer(canvasRef.current);  // Initialize the renderer with the canvas element
    const passes = {
      passes: [
        {
          name: "bufferA",
          fragmentShader: `
            #ifdef GL_ES
            precision mediump float;
            #endif

            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;

            float sdCircle(in vec2 p, in float r) {
              return length(p) - r;
            }

            void main() {
              vec2 p = (2. * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
              vec2 m = (2. * u_mouse.xy - u_resolution.xy) / u_resolution.y;
              vec3 color = vec3(.0);
              float d = sdCircle(p - m, .125);
              color = mix(color, vec3(1.), 1.0 - smoothstep(0.0, 0.01, d));
              gl_FragColor = vec4(color, 1.);
            }
          `,
          textures: [],
        },
        {
          name: "bufferB",
          fragmentShader: `
            precision highp float;
            uniform sampler2D u_texture0;
            uniform vec2 u_resolution;
            void main() {
              vec2 uv = gl_FragCoord.xy / u_resolution;
              vec4 color = texture2D(u_texture0, uv);
              float smoothValue = smoothstep(0.0, 1.0, color.r);
              gl_FragColor = vec4(smoothValue, 0.0, 0.0, 1.0);
            }
          `,
          textures: ["bufferA"],
        },
        {
          name: "MainBuffer",
          fragmentShader: `
            precision highp float;
            uniform sampler2D u_texture0;
            uniform vec2 u_resolution;
            void main() {
              vec2 uv = gl_FragCoord.xy / u_resolution;
              vec4 color = texture2D(u_texture0, uv);
              gl_FragColor = color;
            }
          `,
          textures: ["bufferB"],
        },
      ],
      textures: [],
    };
    rendererRef.current.setup(passes);  // Setup the renderer with the passes
    requestAnimationFrame(rendererRef.current.render);  // Start the rendering loop
  }, []);

  // Render the canvas element
  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default App;
```

### Advanced Usage

For more advanced usage, such as adding multiple passes and using textures, refer to the [API documentation](#) ~in a near future~.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

[//]:  (Externals)
[npm-image]: https://img.shields.io/npm/v/@sohne/shader.vista.svg?style=flat-square&logo=npm
[npm-url]: https://npmjs.org/package/@sohne/shader.vista
[npm-downloads-image]: https://img.shields.io/npm/dm/@sohne/shader.vista.svg
[npm-downloads-url]: https://npmcharts.com/compare/@sohne/shader.vista?minimal=true
[//]:  (EOF)
