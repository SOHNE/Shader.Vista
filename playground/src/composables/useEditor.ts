import type { Ref } from 'vue'
import { autocompletion } from '@codemirror/autocomplete'
import { cpp } from '@codemirror/lang-cpp'
import { EditorState } from '@codemirror/state'
import { EditorView, scrollPastEnd } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { onMounted } from 'vue'
import { glslCompletions } from '../plugins/completions'
import { codeFoldingExtension } from '../plugins/folding'
import { scrollbarRuler, scrollbarRulerTheme } from '../plugins/scrollbar'
import { selectionLineHighlightPlugin } from '../plugins/selection'
import { vitesse } from '../plugins/theme'

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
            cpp(),
            vitesse,
            selectionLineHighlightPlugin,
            scrollbarRuler,
            scrollbarRulerTheme,
            scrollPastEnd(),
            codeFoldingExtension(),
            autocompletion({
              activateOnTyping: true,
              override: [glslCompletions()],
            }),
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
