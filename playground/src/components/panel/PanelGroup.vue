<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { Splitpanes } from 'splitpanes'
import { ref } from 'vue'
import { providePanelGroup } from '../../composables/usePanelGroup'

type Props = {
  panelCount: number
  storageKey: string
  initialSizes?: number[]
  titleHeightPx?: number
}

const props = defineProps<Props>()

const loading = ref(true)
const panelEl = ref<ComponentPublicInstance | null>(null)

const { updatePanelSizes } = providePanelGroup(panelEl, props)

function handleResize({ panes }: { panes: { size: number }[] }) {
  updatePanelSizes(panes.map(panel => panel.size))
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 200)
})
</script>

<template>
  <Splitpanes
    ref="panelEl"
    horizontal
    :class="{ loading }"
    @resized="handleResize"
  >
    <slot />
  </Splitpanes>
</template>
