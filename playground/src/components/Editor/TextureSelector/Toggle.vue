<script setup lang="ts">
type Props = {
  isOpen: boolean
  textureCount: number
}

type Emits = {
  (e: 'toggle'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <button
    class="bg-header hover:bg-hover px-3 py-1.5 text-left outline-none flex flex-shrink-0 w-full cursor-pointer transition-colors items-center justify-between"
    :class="{ 'border-b border-border': isOpen }" @click="emit('toggle')"
  >
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

    <div
      class="i-carbon-chevron-right text-gray-400 transition-transform duration-200 dark:text-[#969696]/50"
      :class="isOpen ? 'rotate-90' : 'rotate-0'"
    />
  </button>
</template>
