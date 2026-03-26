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
  --cm-foreground: #393a34;
  --cm-background: #ffffff;
  --cm-keyword: #248459;
  --cm-property: #998418;
  --cm-punctuation: #393a34;
  --cm-line-number: #999999;
  --cm-comment: #a0ada0;
  --cm-variable: #2e77a3;
  --cm-string: #bc6060;
  --cm-decorator: #6eafad;
  --cm-definition-keyword: #2164a3;
  --cm-line-highlight-background: #f1f1f1;
  --cm-line-highlight-border: #e0e0e0;
  --cm-selection-background: #e5ebf1;
  --cm-tooltip-background: #fafafa;
  --cm-border: #e2e2e2;
}

.dark .editor-container .cm-editor {
  /* CodeMirror Theme Colors (Dark) */
  --cm-foreground: #d4d4d4;
  --cm-background: #1e1e1e;
  --cm-keyword: #569cd6;
  --cm-property: #9cdcfe;
  --cm-punctuation: #d4d4d4;
  --cm-line-number: #858585;
  --cm-comment: #6a9955;
  --cm-variable: #9cdcfe;
  --cm-string: #ce9178;
  --cm-decorator: #dcdcaa;
  --cm-definition-keyword: #569cd6;
  --cm-line-highlight-background: #2c2c2c;
  --cm-line-highlight-border: #3e3e3e;
  --cm-selection-background: #264f78;
  --cm-tooltip-background: #252526;
  --cm-border: #454545;
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
