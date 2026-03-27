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
  value => emit('update:modelValue', value),
)

watch(() => props.modelValue, (newVal) => {
  setValue(newVal)
})
</script>

<template>
  <div ref="editorRef" class="editor-container h-full min-h-0 w-full" />
</template>

<style>
.editor-container .cm-editor {
  height: 100% !important;

  --cm-font-family: 'Fira Code', monospace;
  --cm-font-ligatures: contextual;
  --cm-font-feature-settings: 'calt' 1;
  --cm-font-size: 14px;
  --cm-line-height: 1.6;
  --cm-font-weight-bold: bold;
  --cm-font-style-italic: italic;

  /* CodeMirror Theme Colors (Light) */
  --cm-foreground: hsl(0 5% 21%);
  --cm-background: hsl(0 0% 100%);
  --cm-keyword: hsl(155 48% 30%);
  --cm-property: hsl(45 69% 35%);
  --cm-punctuation: hsl(0 5% 21%);
  --cm-line-number: hsl(0 0% 60%);
  --cm-comment: hsl(120 5% 65%);
  --cm-variable: hsl(205 47% 41%);
  --cm-string: hsl(355 43% 55%);
  --cm-decorator: hsl(178 25% 56%);
  --cm-definition-keyword: hsl(205 77% 38%);
  --cm-line-highlight-background: hsl(0 0% 95%);
  --cm-line-highlight-border: hsl(0 0% 88%);
  --cm-selection-background: hsl(210 43% 92%);
  --cm-tooltip-background: hsl(0 0% 98%);
  --cm-border: hsl(0 0% 89%);
  --cm-word-highlight-background: hsl(210 91% 61% / 0.15);
  --cm-matching-bracket-background: hsl(0 0% 94%);
  --cm-nonmatching-bracket-background: hsl(355 100% 94%);
  --cm-bracket-underline-offset: calc(var(--cm-font-size) * var(--cm-line-height) * 0.15);
}

.dark .editor-container .cm-editor {
  /* CodeMirror Theme Colors (Dark) */
  --cm-foreground: hsl(0 0% 83%);
  --cm-background: hsl(0 0% 12%);
  --cm-keyword: hsl(212 51% 59%);
  --cm-property: hsl(207 84% 85%);
  --cm-punctuation: hsl(0 0% 83%);
  --cm-line-number: hsl(0 0% 52%);
  --cm-comment: hsl(108 32% 47%);
  --cm-variable: hsl(207 84% 85%);
  --cm-string: hsl(15 66% 64%);
  --cm-decorator: hsl(48 53% 75%);
  --cm-definition-keyword: hsl(212 51% 59%);
  --cm-line-highlight-background: hsl(0 0% 17%);
  --cm-line-highlight-border: hsl(0 0% 24%);
  --cm-selection-background: hsl(210 52% 31%);
  --cm-tooltip-background: hsl(0 0% 15%);
  --cm-border: hsl(0 0% 27%);
  --cm-word-highlight-background: hsl(210 91% 61% / 0.25);
  --cm-matching-bracket-background: hsl(0 0% 23%);
  --cm-nonmatching-bracket-background: hsl(355 56% 22%);
  --cm-bracket-underline-offset: calc(var(--cm-font-size) * var(--cm-line-height) * 0.15);
}

/* CodeMirror Fold Markers */
.editor-container .cm-fold-placeholder {
  background: var(--cm-line-highlight-background) !important;
  color: var(--cm-foreground) !important;
  border-radius: 3px;
  border-color: var(--cm-line-highlight-border);
  border-width: 1px;
  padding: 0 6px;
  cursor: pointer;
  user-select: none;
  font-size: 0.85em;
}

.editor-container .cm-fold-placeholder:hover {
  background: var(--cm-selection-background) !important;
  color: var(--cm-punctuation) !important;
}
</style>
