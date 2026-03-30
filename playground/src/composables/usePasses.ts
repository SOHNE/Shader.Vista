import type { PassConfig } from '@actis/core'
import { computed, ref } from 'vue'

export function usePasses(initialPasses: PassConfig[]) {
  // Use a deep copy to avoid modifying the original default object
  const passes = ref<PassConfig[]>(JSON.parse(JSON.stringify(initialPasses)))
  const activePassIndex = ref(1)

  function addPass() {
    const name = `buffer${String.fromCharCode(65 + passes.value.length - 1)}`
    const mainBufferIndex = passes.value.findIndex(p => p.name === 'MainBuffer')
    const newPass = {
      name,
      fragmentShader: `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);
}
      `.trim(),
      textures: [],
    }
    if (mainBufferIndex !== -1) {
      passes.value.splice(mainBufferIndex, 0, newPass)
      activePassIndex.value = mainBufferIndex
    }
    else {
      passes.value.push(newPass)
      activePassIndex.value = passes.value.length - 1
    }
  }

  function removePass(index: number) {
    if (passes.value.length <= 1)
      return
    if (passes.value[index].name === 'MainBuffer')
      return

    const removedName = passes.value[index].name
    passes.value.splice(index, 1)

    // Update texture references in other passes
    passes.value.forEach((p) => {
      p.textures = p.textures.filter(t => t !== removedName)
    })

    if (activePassIndex.value >= passes.value.length) {
      activePassIndex.value = passes.value.length - 1
    }
  }

  const pipelineCode = computed(() => {
    const passesJson = JSON.stringify(passes.value, null, 2)
    return `// Setup Actis renderer
const passes = {
  passes: ${passesJson},
  textures: [],
};

renderer.setup(passes);
renderer.play();
`
  })

  return {
    passes,
    activePassIndex,
    addPass,
    removePass,
    pipelineCode,
  }
}
