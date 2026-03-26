<script setup lang="ts">
import type { PassConfig } from '../../composables/usePasses'
import Item from './Item.vue'

type Props = {
  passes: PassConfig[]
  activeIndex: number
}

type Emits = {
  (e: 'update:activeIndex', index: number): void
  (e: 'add'): void
  (e: 'remove', index: number): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div class="scrollbar-hide bg-header flex items-center relative overflow-x-auto">
    <Item
      v-for="(pass, index) in passes" :key="pass.name" :pass="pass" :is-active="activeIndex === index"
      @click="$emit('update:activeIndex', index)" @remove="$emit('remove', index)"
    />
    <button
      class="hover:bg-hover ml-2 rounded flex-center shrink-0 h-7 w-7 transition-colors" title="Add New Pass"
      @click="$emit('add')"
    >
      <div class="i-carbon-add text-lg text-dim" />
    </button>

    <!-- Border -->
    <div class="bg-border h-px bottom-0 left-0 right-0 absolute" />
  </div>
</template>
