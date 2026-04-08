<script setup lang="ts">
import type { PassConfig } from '@actis/core'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { Pane, Splitpanes } from 'splitpanes'
import { computed, ref, watch } from 'vue'
import { usePasses } from '../composables/usePasses'
import { useSharing } from '../composables/useSharing'
import PassEditor from './Editor/PassEditor.vue'
import Header from './Header/Header.vue'
import Preview from './Preview/Preview.vue'
import TabBar from './Tabs/TabBar.vue'

const DEFAULT_PIPELINE = [
  {
    name: 'bufferA',
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
    `.trim(),
    textures: [],
  },
  {
    name: 'MainBuffer',
    fragmentShader: `
precision highp float;
uniform sampler2D u_texture0;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec4 color = texture2D(u_texture0, uv);
  gl_FragColor = color;
}
    `.trim(),
    textures: ['bufferA'],
  },
]

const { passes, activePassIndex, addPass, removePass, pipelineCode } = usePasses(DEFAULT_PIPELINE)

// code is used for Preview.vue and Header.vue (sharing)
const code = ref('')
watch(pipelineCode, (newJs) => {
  code.value = newJs
}, { immediate: true })

const { getCodeFromUrl } = useSharing(code)

// Check for shared code on mount
const sharedCode = getCodeFromUrl()
if (sharedCode) {
  try {
    const passesMatch = sharedCode.match(/passes:\s*(\[[\s\S]+\])\s*,\s*textures\s*:/)
    if (passesMatch) {
      // In a real app we might need a more robust parser if it's not strictly JSON,
      // but for this prototype we'll try to keep it safe.
      // We'll replace property names without quotes to make it valid JSON if needed
      const jsonStr = passesMatch[1]
        .replace(/(\w+):/g, '"$1":')
        .replace(/'/g, '"')
      const parsedPasses = JSON.parse(jsonStr)
      if (Array.isArray(parsedPasses)) {
        passes.value = parsedPasses.map(pass => normalizePassConfig(pass as PassConfig))
      }
    }
  }
  catch (e) {
    console.error('Failed to parse shared passes:', e)
  }
}

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('md')
const horizontal = computed(() => isMobile.value)

function trimEmptyTextureSlots(textures: string[]) {
  let lastIndex = textures.length - 1
  while (lastIndex >= 0 && !textures[lastIndex]) {
    lastIndex--
  }

  return textures.slice(0, lastIndex + 1)
}

function normalizePassConfig(pass: PassConfig): PassConfig {
  const nextTextures = trimEmptyTextureSlots(pass.textures ?? [])
  const {
    offscreen: _ignoredOffscreen,
    pingPong: _ignoredPingPong,
    ...nextPass
  } = pass as PassConfig & { offscreen?: boolean }

  return {
    ...nextPass,
    textures: nextTextures,
  }
}

function updatePassTextures(index: number, textures: string[]) {
  const pass = passes.value[index]
  if (!pass) {
    return
  }

  passes.value[index] = normalizePassConfig({
    ...pass,
    textures,
  })
}
</script>

<template>
  <div class="playground-container text-main bg-main flex flex-col h-[100dvh] w-screen overflow-hidden">
    <div class="flex-1 overflow-hidden">
      <Splitpanes :horizontal="horizontal">
        <Pane :size="horizontal ? 40 : 50">
          <Preview :code="code" />
        </Pane>
        <Pane :size="horizontal ? 60 : 50" class="flex flex-col min-h-0 min-w-0">
          <Header :code="code" />
          <div class="flex flex-1 flex-col min-h-0">
            <TabBar v-model:active-index="activePassIndex" :passes="passes" @add="addPass" @remove="removePass" />

            <div class="flex flex-1 flex-col min-h-0">
              <PassEditor
                v-if="passes[activePassIndex]" :active-pass="passes[activePassIndex]" :passes="passes"
                @update:fragment-shader="passes[activePassIndex].fragmentShader = $event"
                @update:textures="updatePassTextures(activePassIndex, $event)"
              />
            </div>
          </div>
        </Pane>
      </Splitpanes>
    </div>
  </div>
</template>
