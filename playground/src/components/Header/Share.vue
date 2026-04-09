<script setup lang="ts">
import { useSharing } from '../../composables/useSharing'

const props = defineProps<{
  code: string
}>()

const { share, copied } = useSharing()
</script>

<template>
  <button
    class="icon-btn flex items-center"
    :class="copied ? 'success' : ''"
    :title="copied ? 'URL Copied!' : 'Share Code'"
    @click="share(props.code)"
  >
    <div :class="copied ? 'i-carbon-checkmark' : 'i-carbon-share'" class="text-base" />
  </button>
</template>
