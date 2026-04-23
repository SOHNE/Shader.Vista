<script setup lang="ts">
import { Pane } from 'splitpanes'
import { computed, watch } from 'vue'
import { usePanelGroup } from '../../composables/usePanelGroup'

type Props = {
  index: number
  contentClass?: string
  bodyClass?: string
  paneClass?: string
}

type Emits = {
  (e: 'toggle'): void
  (e: 'openChange', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  contentClass: '',
  bodyClass: '',
  paneClass: '',
})

const emit = defineEmits<Emits>()
const { panelSizes, titleHeightPercent, isCollapsed, togglePanel } = usePanelGroup()

const isOpen = computed(() => !isCollapsed(props.index))

watch(isOpen, value => emit('openChange', value), { immediate: true })

function handleToggle() {
  togglePanel(props.index)
  emit('toggle')
}
</script>

<template>
  <Pane
    :min-size="titleHeightPercent"
    :size="panelSizes[index]"
    class="border-t border-border bg-canvas flex flex-col min-h-0 select-none transition-all overflow-hidden"
    :class="paneClass"
  >
    <button
      class="bg-header hover:bg-hover px-3 py-1.5 text-left outline-none flex flex-shrink-0 min-h-[34px] w-full cursor-pointer transition-colors items-center justify-between"
      :class="{ 'border-b border-border': isOpen }"
      @click="handleToggle"
    >
      <div class="flex flex-1 gap-2 min-w-0 items-center">
        <slot name="header" :is-open="isOpen" />
      </div>

      <slot name="after" :is-open="isOpen">
        <div
          class="i-carbon-chevron-right text-gray-400 transition-transform duration-400 dark:text-[#969696]/50"
          :class="isOpen ? 'rotate-90' : 'rotate-0'"
        />
      </slot>
    </button>

    <div class="flex flex-1 min-h-0 w-full overflow-hidden" :class="contentClass">
      <div class="w-full" :class="bodyClass">
        <slot :is-open="isOpen" />
      </div>
    </div>
  </Pane>
</template>
