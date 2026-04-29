<script setup lang="ts">
import type { PassConfig } from '@actis/core'
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'
import { useShaderExport } from '../../composables/useShaderExport'

const props = defineProps<{
  passes: PassConfig[]
}>()

const el = ref<HTMLElement | null>(null)
const expanded = ref(false)
const {
  esmCoreLabel,
  exportHtmlCore,
  exportHtmlEsm,
  exportTitle,
  hasPreviewVersionMismatch,
  isExporting,
  workspaceCoreLabel,
} = useShaderExport(() => props.passes)

onClickOutside(el, () => {
  expanded.value = false
})

function toggle() {
  expanded.value = !expanded.value
}

async function handleHtmlCoreExport() {
  if (await exportHtmlCore()) {
    expanded.value = false
  }
}

async function handleHtmlEsmExport() {
  if (await exportHtmlEsm()) {
    expanded.value = false
  }
}
</script>

<template>
  <div ref="el" class="relative" @click.stop>
    <button
      class="icon-btn flex gap-0.5 items-center"
      :title="exportTitle"
      aria-haspopup="menu"
      :aria-expanded="expanded"
      @click="toggle"
    >
      <div class="i-carbon-download text-base" />
      <div class="i-carbon-chevron-down text-xs opacity-60" />
    </button>

    <div
      v-if="expanded"
      class="py-1 border border-border rounded bg-surface-1 w-52 shadow-lg right-0 top-full absolute z-50"
      role="menu"
    >
      <button
        class="text-primary p-item text-left flex gap-2 w-full cursor-pointer items-center hover:bg-surface-2"
        role="menuitem"
        :disabled="isExporting"
        :class="isExporting ? 'opacity-60 cursor-wait' : ''"
        @click="handleHtmlCoreExport"
      >
        <div class="i-carbon-html text-base text-accent flex-shrink-0" />
        <span class="flex flex-col min-w-0">
          <span class="text-sm">HTML + Actis core</span>
          <span class="text-[10px] text-muted leading-tight">
            {{ workspaceCoreLabel }}
            <template v-if="hasPreviewVersionMismatch">
              embedded
            </template>
          </span>
        </span>
      </button>

      <button
        class="text-primary p-item text-left flex gap-2 w-full cursor-pointer items-center hover:bg-surface-2"
        role="menuitem"
        :disabled="isExporting"
        :class="isExporting ? 'opacity-60 cursor-wait' : ''"
        @click="handleHtmlEsmExport"
      >
        <div class="i-carbon-cloud-download text-base text-accent flex-shrink-0" />
        <span class="flex flex-col min-w-0">
          <span class="text-sm">HTML + esm.sh</span>
          <span class="text-[10px] text-muted leading-tight">
            {{ esmCoreLabel }}
            <template v-if="hasPreviewVersionMismatch">
              selected
            </template>
          </span>
        </span>
      </button>
    </div>
  </div>
</template>
