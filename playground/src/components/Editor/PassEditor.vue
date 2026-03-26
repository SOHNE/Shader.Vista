<script setup lang="ts">
import type { PassConfig } from '../../composables/usePasses'
import CodeMirror from './CodeMirror.vue'
import TextureSelector from './TextureSelector/Index.vue'

type Props = {
  activePass: PassConfig
  passes: PassConfig[]
}

type Emits = {
  (e: 'update:fragmentShader', value: string): void
  (e: 'update:textures', value: string[]): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="text-main bg-main flex flex-1 flex-col min-h-0">
    <CodeMirror
      :model-value="activePass.fragmentShader" class="flex-1"
      @update:model-value="emit('update:fragmentShader', $event)"
    />
    <TextureSelector :active-pass="activePass" :passes="passes" @update:textures="emit('update:textures', $event)" />
  </div>
</template>
