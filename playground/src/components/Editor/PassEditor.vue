<script setup lang="ts">
import type { PassConfig } from '@actis/core'
import CollapsiblePanel from '../panel/CollapsiblePanel.vue'
import PanelGroup from '../panel/PanelGroup.vue'
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
    <PanelGroup storage-key="actis-editor-panel-sizes" :panel-count="2" :initial-sizes="[78, 22]">
      <CollapsiblePanel
        :index="0"
        content-class="min-h-0"
        body-class="flex flex-1 min-h-0"
      >
        <template #header="{ isOpen }">
          <div class="flex gap-2 items-center">
            <div class="i-carbon-code transition-colors" :class="isOpen ? 'text-accent' : 'text-dim'" />
            <span
              class="text-xs tracking-wider font-semibold uppercase transition-colors"
              :class="isOpen ? 'text-main' : 'text-dim'"
            >
              Fragment Shader
            </span>
          </div>
        </template>

        <CodeMirror
          :model-value="activePass.fragmentShader" class="flex-1"
          @update:model-value="emit('update:fragmentShader', $event)"
        />
      </CollapsiblePanel>

      <TextureSelector
        :index="1"
        :active-pass="activePass"
        :passes="passes"
        @update:textures="emit('update:textures', $event)"
      />
    </PanelGroup>
  </div>
</template>
