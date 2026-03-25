<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { Pane, Splitpanes } from 'splitpanes'
import { computed, ref } from 'vue'
import { useSharing } from '../composables/useSharing'
import Editor from './Editor/Editor.vue'
import Header from './Header/Header.vue'
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
const { getCodeFromUrl } = useSharing(code)

const sharedCode = getCodeFromUrl()
if (sharedCode) {
  code.value = sharedCode
}

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('md')
const horizontal = computed(() => isMobile.value)
</script>

<template>
  <div class="playground-container h-[100dvh] w-screen flex flex-col overflow-hidden text-main bg-main">
    <div class="flex-1 overflow-hidden">
      <Splitpanes class="default-theme" :horizontal="horizontal">
        <Pane :size="horizontal ? 40 : 50">
          <Preview :code="code" />
        </Pane>
        <Pane :size="horizontal ? 60 : 50" class="flex flex-col min-h-0 min-w-0">
          <Header :code="code" />
          <Editor v-model="code" class="flex-1" />
        </Pane>
      </Splitpanes>
    </div>
  </div>
</template>

<style>
.splitpanes.default-theme .splitpanes__pane {
  background-color: transparent;
  transition: all 0.4s ease-in-out;
}
.splitpanes.default-theme .splitpanes__splitter {
  /* Minimal background to show the line */
  @apply bg-gray-200 dark:bg-gray-800;
  transition: all 0.4s ease-in-out;
}
.splitpanes.default-theme.splitpanes--vertical > .splitpanes__splitter {
  width: 1px;
}
.splitpanes.default-theme.splitpanes--horizontal > .splitpanes__splitter {
  height: 1px;
}
</style>
