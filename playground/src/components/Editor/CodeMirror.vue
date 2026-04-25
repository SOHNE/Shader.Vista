<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEditor } from '../../composables/useEditor'
import '@actis/codemirror/styles.css'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const editorRef = ref<HTMLDivElement | null>(null)

const { setValue } = useEditor(
  editorRef,
  props.modelValue,
  value => emit('update:modelValue', value),
)

watch(() => props.modelValue, (newVal) => {
  setValue(newVal)
})
</script>

<template>
  <div ref="editorRef" class="cm-actis-editor h-full min-h-0 w-full" />
</template>
