import type { Extension } from '@codemirror/state'
import { codeFolding } from '@codemirror/language'

export function codeFoldingExtension(): Extension {
  return [
    // foldGutter({
    //   markerDOM(open) {
    //     const marker = document.createElement('span')
    //     marker.className = open ? 'cm-fold-marker' : 'cm-fold-marker cm-fold-marker--folded'
    //     marker.setAttribute('aria-label', open ? 'fold' : 'unfold')
    //     marker.style.touchAction = 'manipulation'
    //     return marker
    //   },
    // }),
    codeFolding({
      preparePlaceholder(state, range) {
        const from = state.doc.lineAt(range.from).number
        const to = state.doc.lineAt(range.to).number
        return `${to - from} lines`
      },
      placeholderDOM(_view, onclick, text) {
        const placeholder = document.createElement('span')
        placeholder.className = 'cm-fold-placeholder'
        placeholder.textContent = text as string
        placeholder.setAttribute('role', 'button')
        placeholder.setAttribute('aria-label', 'unfold code')
        placeholder.setAttribute('title', 'Click to unfold')
        placeholder.setAttribute('tabindex', '0')
        placeholder.style.touchAction = 'manipulation'
        placeholder.addEventListener('click', onclick)
        placeholder.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onclick(e as unknown as MouseEvent)
          }
        })
        return placeholder
      },
    }),
  ]
}
