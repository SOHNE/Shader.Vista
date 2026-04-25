import type { Extension } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'

const WORD_BEFORE_PATTERN = /\w*$/
const WORD_AFTER_PATTERN = /^\w*/
const ESCAPE_REGEX_PATTERN = /[.*+?^${}()|[\]\\]/g

function escapeRegExp(string: string): string {
  return string.replace(ESCAPE_REGEX_PATTERN, '\\$&')
}

export const wordHighlightPlugin: Extension = ViewPlugin.fromClass(class {
  decorations: ReturnType<typeof Decoration.set> = Decoration.none
  cachedWord: string | null = null
  cachedDecorations: ReturnType<typeof Decoration.set> | null = null

  update(update: ViewUpdate) {
    if (update.selectionSet || update.docChanged) {
      const word = this.getCurrentWord(update.view)

      if (word !== this.cachedWord || update.docChanged) {
        this.cachedWord = word
        if (word) {
          this.cachedDecorations = this.buildDecorations(update.view, word)
        }
        else {
          this.cachedDecorations = Decoration.none
        }
        this.decorations = this.cachedDecorations
      }
    }
  }

  getCurrentWord(view: EditorView): string | null {
    const { state } = view
    const { selection, doc } = state

    for (const range of selection.ranges) {
      if (range.empty) {
        const pos = range.head
        const line = doc.lineAt(pos)
        const text = line.text
        const offset = pos - line.from

        const beforeMatch = text.slice(0, offset).match(WORD_BEFORE_PATTERN)
        const afterMatch = text.slice(offset).match(WORD_AFTER_PATTERN)

        if (beforeMatch && afterMatch) {
          const wordStart = offset - beforeMatch[0].length
          const word = text.slice(wordStart, wordStart + beforeMatch[0].length + afterMatch[0].length)

          if (word.length > 0) {
            const charBefore = wordStart > 0 ? text[wordStart - 1] : ''
            if (charBefore === '.') {
              return null
            }
            return word
          }
        }
      }
    }
    return null
  }

  buildDecorations(view: EditorView, word: string) {
    const { doc } = view.state
    const builder = new RangeSetBuilder<Decoration>()
    const escapedWord = escapeRegExp(word)
    const pattern = new RegExp(`(?<!\\.)\\b${escapedWord}\\b`, 'g')

    for (let lineNum = 1; lineNum <= doc.lines; lineNum++) {
      const line = doc.line(lineNum)
      pattern.lastIndex = 0

      let match: RegExpExecArray | null
      while (true) {
        match = pattern.exec(line.text)
        if (match === null)
          break

        const from = line.from + match.index
        const to = from + match[0].length
        builder.add(from, to, Decoration.mark({ class: 'cm-word-highlight' }))
      }
    }

    return builder.finish()
  }
}, {
  decorations: v => v.decorations,
})

export const wordHighlightTheme: Extension = EditorView.baseTheme({
  '.cm-word-highlight': {
    backgroundColor: 'var(--cm-word-highlight-background, hsl(210 91% 61% / 0.15))',
    borderRadius: '2px',
  },
})

export function wordHighlightExtension(): Extension {
  return [
    wordHighlightPlugin,
    wordHighlightTheme,
  ]
}
