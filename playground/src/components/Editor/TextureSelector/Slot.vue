<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  index: number
  textureName: string
  isSelected: boolean
}

type Emits = {
  (e: 'click'): void
  (e: 'remove'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const hasTexture = computed(() => !!props.textureName)
</script>

<template>
  <div
    class="group border-2 rounded-lg flex-center flex-col min-w-[70px] aspect-square cursor-pointer transition-all relative overflow-hidden"
    :class="[
      hasTexture
        ? 'border-accent bg-accent-subtle hover:border-accent'
        : 'border-dashed border-border bg-gray-50/50 dark:bg-white/5 hover:border-gray-400 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10',
      isSelected ? 'ring-accent ring-2 ring-offset-2 dark:ring-offset-[#1e1e1e] border-solid' : '',
    ]"
    @click="emit('click')"
  >
    <!-- Slot Index Label -->
    <div
      class="text-[9px] font-bold uppercase left-1.5 top-1 absolute z-10"
      :class="hasTexture ? 'text-accent' : 'text-dim'"
    >
      u_texture{{ index }}
    </div>

    <!-- Content -->
    <template v-if="hasTexture">
      <div class="i-carbon-layers text-xl text-accent mb-1" />
      <span
        class="text-[10px] text-accent font-medium px-2 text-center w-full truncate"
        :title="textureName"
      >
        {{ textureName }}
      </span>

      <!-- Clear button -->
      <button
        class="text-muted border border-border rounded-full bg-white/80 opacity-0 flex-center h-5 w-5 shadow-sm transition-all right-1 top-1 absolute z-20 backdrop-blur-sm hover:text-red-500 hover:border-red-500 dark:bg-[#252526]/80 group-hover:opacity-100 dark:hover:text-red-400 dark:hover:border-red-400"
        title="Remove texture"
        @click.stop="emit('remove')"
      >
        <div class="i-carbon-close text-[12px]" />
      </button>
    </template>
    <template v-else>
      <div
        class="i-carbon-add text-2xl text-gray-300 transition-transform duration-200 dark:text-gray-600"
        :class="{ 'scale-110 text-accent': isSelected, 'group-hover:scale-110 group-hover:text-gray-400 dark:group-hover:text-gray-400': !isSelected }"
      />
      <span
        class="text-base text-dim font-medium mt-1 transition-colors group-hover:text-gray-500 dark:group-hover:text-gray-400"
      >Assign</span>
    </template>
  </div>
</template>
