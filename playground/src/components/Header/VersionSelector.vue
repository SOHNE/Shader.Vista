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
  <div ref="el" class="text-xs ml-2 relative" @click.stop>
    <button
      class="p-btn-sm rounded bg-surface-3 flex gap-0.5 cursor-pointer transition-colors items-center hover:bg-surface-2"
      @click="toggle"
    >
      <span class="text-accent font-mono">
        {{ formatVersion(selectedVersion) }}
      </span>
      <div class="i-carbon-chevron-down opacity-50" />
    </button>

    <div
      v-if="expanded"
      class="font-mono mt-1 py-1 border border-border rounded bg-surface-1 max-h-60 w-52 shadow-lg left-0 top-full absolute z-50 overflow-y-auto"
    >
      <div
        v-for="ver in versions" :key="ver"
        class="group p-item flex cursor-pointer items-center justify-between hover:bg-surface-2"
        :class="ver === selectedVersion ? 'text-accent font-bold' : 'text-muted'" @click="setVersion(ver)"
      >
        <span>{{ formatVersion(ver) }}</span>
        <a
          v-if="ver !== 'latest'" :href="getReleaseLink(ver)" target="_blank"
          class="opacity-0 transition-opacity group-hover:opacity-50 hover:opacity-100" @click.stop
        >
          <div class="i-carbon-launch text-sm" />
        </a>
      </div>
    </div>
  </div>
</template>
