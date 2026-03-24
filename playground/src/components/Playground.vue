<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import { ref } from 'vue'
import Editor from './Editor/Editor.vue'
import Preview from './Preview/Preview.vue'
import 'splitpanes/dist/splitpanes.css'

const initialCode = `// Setup Shader.Vista renderer
const passes = {
  passes: [
    {
      name: "MainBuffer",
      fragmentShader: \`
        precision highp float;
        uniform vec2 u_resolution;
        uniform float u_time;

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution;
          vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));
          gl_FragColor = vec4(color, 1.0);
        }
      \`,
      textures: [],
    },
  ],
  textures: [],
};

renderer.setup(passes);
renderer.play();
`

const code = ref(initialCode)
</script>

<template>
  <div class="playground-container h-screen w-screen overflow-hidden">
    <Splitpanes class="default-theme">
      <Pane>
        <Preview :code="code" />
      </Pane>
      <Pane>
        <Editor v-model="code" />
      </Pane>
    </Splitpanes>
  </div>
</template>

<style>
.splitpanes.default-theme .splitpanes__pane {
  background-color: transparent;
}
.splitpanes.default-theme .splitpanes__splitter {
  background-color: #444;
  width: 3px;
}
</style>
