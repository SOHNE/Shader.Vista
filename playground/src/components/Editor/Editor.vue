<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEditor } from '../../composables/useEditor'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const editorRef = ref<HTMLDivElement | null>(null)

const { setValue } = useEditor(
  editorRef,
  props.modelValue,
  (value) => emit('update:modelValue', value),
)

watch(() => props.modelValue, (newVal) => {
  setValue(newVal)
})
</script>

<template>
  <div ref="editorRef" class="editor-container h-full w-full"></div>
</template>

<style>
.editor-container .cm-editor {
  height: 100% !important;
}
</style>
