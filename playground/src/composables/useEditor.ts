import type { Ref } from 'vue'
import { glslEditorExtensions } from '@actis/codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { onMounted } from 'vue'

export function useEditor(
  container: Ref<HTMLDivElement | null>,
  initialValue: string,
  onChange: (value: string) => void,
) {
  let view: EditorView | null = null

  onMounted(() => {
    if (container.value) {
      view = new EditorView({
        state: EditorState.create({
          doc: initialValue,
          extensions: glslEditorExtensions({ onChange }),
        }),
        parent: container.value,
      })
    }
  })

  function setValue(value: string) {
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      })
    }
  }

  return {
    setValue,
  }
}
