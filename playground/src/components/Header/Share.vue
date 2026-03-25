<script setup lang="ts">
import { useSharing } from '../../composables/useSharing'

const props = defineProps<{
  code: string
}>()

const { share, copied } = useSharing({
  get value() {
    return props.code
  },
})
</script>

<template>
  <button
    class="icon-btn flex items-center"
    :class="copied ? 'text-green-600 dark:text-green-400' : ''"
    :title="copied ? 'URL Copied!' : 'Share Code'"
    @click="share"
  >
    <div :class="copied ? 'i-carbon-checkmark' : 'i-carbon-share'" class="text-base" />
  </button>
</template>
