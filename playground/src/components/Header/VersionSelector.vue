<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'
import { useVersions } from '../../composables/useVersions'

const { versions, workspaceVersion, gitSha, selectedVersion, setVersion, getReleaseLink } = useVersions()

const el = ref<HTMLElement | null>(null)
const expanded = ref(false)

onClickOutside(el, () => {
  expanded.value = false
})

function toggle() {
  expanded.value = !expanded.value
}

function formatVersion(ver: string) {
  if (ver === 'latest') {
    return `v${workspaceVersion.value}* (${gitSha.value.slice(0, 7)})`
  }
  return `v${ver}`
}
</script>

<template>
  <div ref="el" class="ml-2 relative text-xs" @click.stop>
    <button class="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-hover transition-colors" @click="toggle">
      <span class="text-primary font-mono">
        {{ formatVersion(selectedVersion) }}
      </span>
      <div class="i-carbon-chevron-down opacity-50" />
    </button>

    <div
      v-if="expanded"
      class="absolute left-0 top-full mt-1 w-52 max-h-60 overflow-y-auto bg-popover border border-main rounded shadow-lg z-50 py-1 font-mono"
    >
      <div
        v-for="ver in versions" :key="ver"
        class="group flex items-center justify-between px-3 py-1 hover:bg-hover cursor-pointer"
        :class="ver === selectedVersion ? 'text-primary font-bold' : 'text-muted'" @click="setVersion(ver)"
      >
        <span>{{ formatVersion(ver) }}</span>
        <a
          v-if="ver !== 'latest'" :href="getReleaseLink(ver)" target="_blank"
          class="opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity" @click.stop
        >
          <div class="i-carbon-launch text-[10px]" />
        </a>
      </div>
    </div>
  </div>
</template>
