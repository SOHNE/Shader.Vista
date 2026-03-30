<script setup lang="ts">
import type { PassConfig } from '@actis/core'
import { computed, ref, watch } from 'vue'
import AssignmentPanel from './AssignmentPanel.vue'
import Slot from './Slot.vue'
import Toggle from './Toggle.vue'

type Props = {
  activePass: PassConfig
  passes: PassConfig[]
}

type Emits = {
  (e: 'update:textures', textures: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(true)
const selectingIndex = ref<number | null>(null)

// When closed, clear selection
watch(isOpen, (val) => {
  if (!val)
    selectingIndex.value = null
})

// When active pass changes, clear selection
watch(() => props.activePass.name, () => {
  selectingIndex.value = null
})

const otherPasses = computed(() =>
  props.passes.filter(p => p.name !== props.activePass.name),
)

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
</script>

<template>
  <div class="border-t border-border bg-canvas flex flex-shrink-0 flex-col select-none transition-all">
    <!-- Header/Toggle Button -->
    <Toggle
      :is-open="isOpen"
      :texture-count="textureCount"
      @toggle="isOpen = !isOpen"
    />

    <!-- Content Area -->
    <div v-show="isOpen" class="flex flex-col max-h-72 w-full overflow-hidden">
      <div class="p-4 flex flex-col gap-4 overflow-y-auto">
        <!-- Channel Slots Container -->
        <div class="pb-2 flex w-full justify-center overflow-x-auto">
          <div class="gap-3 grid grid-cols-4 max-w-2xl min-w-[320px] w-full">
            <Slot
              v-for="i in 4"
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
          :other-passes="otherPasses"
          @assign="handleAssign"
          @close="selectingIndex = null"
        />
      </div>
    </div>
  </div>
</template>
