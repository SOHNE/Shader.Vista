<script setup lang="ts">
import type { PassConfig } from '@actis/core'

type Props = {
  selectingIndex: number
  activePassTextures: string[]
  otherPasses: PassConfig[]
}

type Emits = {
  (e: 'assign', passName: string | null): void
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div
    class="animate-in fade-in slide-in-from-top-2 p-3 border border-border rounded-lg bg-gray-50 flex flex-col gap-2 shadow-inner duration-200 dark:bg-[#252526]"
  >
    <div class="px-1 flex items-center justify-between">
      <span class="text-base text-gray-600 tracking-wider font-semibold uppercase dark:text-gray-300">
        Assign to <span class="text-accent font-bold">u_texture{{ selectingIndex }}</span>
      </span>
      <button
        class="hover:text-main hover:bg-hover text-dim p-1 rounded-full transition-colors"
        @click="emit('close')"
      >
        <div class="i-carbon-close text-sm" />
      </button>
    </div>

    <div
      v-if="otherPasses.length === 0"
      class="text-dim py-6 text-center border border-border rounded border-dashed bg-canvas flex-center flex-col"
    >
      <div class="i-carbon-warning-alt text-xl mb-2" />
      <span class="text-xs">No other passes available to use as textures.</span>
    </div>
    <div v-else class="mt-1 gap-2 grid grid-cols-2">
      <button
        v-for="otherPass in otherPasses"
        :key="otherPass.name"
        class="group px-3 py-2.5 text-left border rounded flex gap-2.5 transition-all items-center"
        :class="
          activePassTextures[selectingIndex] === otherPass.name
            ? 'border-accent accent-subtle'
            : 'border-border bg-canvas hover:border-accent hover:shadow-sm'
        "
        @click="emit('assign', otherPass.name)"
      >
        <div
          class="i-carbon-layers text-sm"
          :class="
            activePassTextures[selectingIndex] === otherPass.name
              ? 'text-accent'
              : 'text-gray-400 group-hover:text-accent'
          "
        />
        <div class="flex flex-col overflow-hidden">
          <span
            class="text-xs font-semibold truncate"
            :class="
              activePassTextures[selectingIndex] === otherPass.name
                ? 'text-accent'
                : 'text-gray-700 dark:text-gray-300 group-hover:text-main'
            "
          >
            {{ otherPass.name }}
          </span>
        </div>
      </button>
      <button
        v-if="activePassTextures[selectingIndex]"
        class="group px-3 py-2.5 text-left border border-border rounded bg-canvas flex gap-2.5 col-span-2 transition-all items-center hover:border-red-400 hover:bg-red-50 sm:col-span-1 dark:hover:border-red-500/50 dark:hover:bg-red-500/10"
        @click="emit('assign', null)"
      >
        <div class="i-carbon-trash-can text-sm text-gray-400 group-hover:text-red-500" />
        <span
          class="text-xs text-gray-600 font-medium dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400"
        >
          Clear Slot
        </span>
      </button>
    </div>
  </div>
</template>
