import type { ViewUpdate } from '@codemirror/view'
import { ViewPlugin } from '@codemirror/view'

export const selectionLineHighlightPlugin = ViewPlugin.fromClass(class {
  update(update: ViewUpdate) {
    if (update.selectionSet || update.docChanged) {
      const { state, dom } = update.view
      const hasSelection = state.selection.ranges.some(r => !r.empty)

      if (hasSelection) {
        dom.style.setProperty('--cm-line-highlight-background', 'transparent')
        dom.style.setProperty('--cm-line-highlight-border', 'transparent')
      }
      else {
        dom.style.removeProperty('--cm-line-highlight-background')
        dom.style.removeProperty('--cm-line-highlight-border')
      }
    }
  }
})
