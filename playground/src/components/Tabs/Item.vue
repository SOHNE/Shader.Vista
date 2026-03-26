<script setup lang="ts">
import type { PassConfig } from '../../composables/usePasses'

type Props = {
  pass: PassConfig
  isActive: boolean
}

type Emits = {
  (e: 'click'): void
  (e: 'remove'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div
    class="group px-3 border-r border-border flex h-9 min-w-fit cursor-pointer select-none whitespace-nowrap transition-colors items-center relative"
    :class="isActive ? 'bg-tab-active' : 'bg-tab-inactive hover:bg-tab-hover'" @click="$emit('click')"
  >
    <!-- Tab Name -->
    <span class="text-xs mr-1" :class="isActive ? 'text-main' : 'text-dim'">
      {{ pass.name }}
    </span>

    <!-- Close button -->
    <template v-if="pass.name !== 'MainBuffer'">
      <button
        class="hover:bg-hover ml-1 rounded flex-center h-5 w-5 transition-colors"
        :class="isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'" @click.stop="$emit('remove')"
      >
        <div class="i-carbon-close text-sm" :class="isActive ? 'text-muted' : 'text-dim'" />
      </button>
    </template>

    <!-- Indicators -->
    <template v-if="isActive">
      <span class="m-0 p-0 bg-accent h-px left-0 right-0 top-0 absolute z-10" />
      <span class="m-0 p-0 bg-tab-active h-px bottom-0 left-0 right-0 absolute z-10" />
    </template>
  </div>
</template>
