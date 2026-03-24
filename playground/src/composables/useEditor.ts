import { type Ref, onMounted } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { vitesse } from '../plugins/theme'
import { selectionLineHighlightPlugin } from '../plugins/selection-plugin'

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
          extensions: [
            basicSetup,
            javascript(),
            vitesse,
            selectionLineHighlightPlugin,
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                onChange(update.state.doc.toString())
              }
            }),
          ],
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
