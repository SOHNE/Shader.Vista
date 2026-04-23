<script setup lang="ts">
import type { PassConfig } from '@actis/core'
import { TEXTURE_CHANNEL_COUNT } from '@actis/core'
import { computed, ref, watch } from 'vue'
import CollapsiblePanel from '../../panel/CollapsiblePanel.vue'
import AssignmentPanel from './AssignmentPanel.vue'
import Slot from './Slot.vue'

type Props = {
  index: number
  activePass: PassConfig
  passes: PassConfig[]
}

type Emits = {
  (e: 'update:textures', textures: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectingIndex = ref<number | null>(null)

// When active pass changes, clear selection
watch(() => props.activePass.name, () => {
  selectingIndex.value = null
})

const availablePasses = computed(() => props.passes)

const textureCount = computed(() =>
  props.activePass.textures.filter(Boolean).length,
)

function assignTexture(index: number, passName: string | null) {
  const textures = [...props.activePass.textures]
  // Ensure the array is long enough to accommodate the index
  while (textures.length <= index) {
    textures.push('')
  }
  textures[index] = passName || ''

  // Trim trailing empty strings to keep the array clean for the renderer
  let lastIndex = textures.length - 1
  while (lastIndex >= 0 && !textures[lastIndex]) {
    lastIndex--
  }
  emit('update:textures', textures.slice(0, lastIndex + 1))
  selectingIndex.value = null
}

function handleSlotClick(index: number) {
  selectingIndex.value = selectingIndex.value === index ? null : index
}

function handleSlotRemove(index: number) {
  assignTexture(index, null)
}

function handleAssign(passName: string | null) {
  if (selectingIndex.value !== null) {
    assignTexture(selectingIndex.value, passName)
  }
}

function handleOpenChange(isOpen: boolean) {
  if (!isOpen) {
    selectingIndex.value = null
  }
}
</script>

<template>
  <CollapsiblePanel
    :index="index"
    content-class="min-h-0"
    body-class="p-4 flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto"
    @open-change="handleOpenChange"
  >
    <template #header="{ isOpen }">
      <div class="flex gap-2 items-center">
        <div class="i-carbon-image-reference transition-colors" :class="isOpen ? 'text-accent' : 'text-dim'" />
        <span
          class="text-xs tracking-wider font-semibold uppercase transition-colors"
          :class="isOpen ? 'text-main' : 'text-dim'"
        >
          Textures
        </span>

        <span v-if="textureCount" class="badge text-white text-center bg-accent min-w-4 dark:text-gray-950">
          {{ textureCount }}
        </span>
      </div>
    </template>

    <!-- Channel Slots Container -->
    <div class="pb-2 flex w-full justify-center overflow-x-auto">
      <div class="gap-3 grid grid-cols-4 max-w-2xl min-w-[320px] w-full">
        <Slot
          v-for="i in TEXTURE_CHANNEL_COUNT"
          :key="i - 1"
          :index="i - 1"
          :texture-name="activePass.textures[i - 1]"
          :is-selected="selectingIndex === i - 1"
          @click="handleSlotClick(i - 1)"
          @remove="handleSlotRemove(i - 1)"
        />
      </div>
    </div>

    <!-- Selector List -->
    <AssignmentPanel
      v-if="selectingIndex !== null"
      :selecting-index="selectingIndex"
      :active-pass-textures="activePass.textures"
      :active-pass-name="activePass.name"
      :available-passes="availablePasses"
      @assign="handleAssign"
      @close="selectingIndex = null"
    />
  </CollapsiblePanel>
</template>
