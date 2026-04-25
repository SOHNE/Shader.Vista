import type { Extension, Text } from '@codemirror/state'
import type { DecorationSet, EditorView, ViewUpdate } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, ViewPlugin } from '@codemirror/view'

const PAIRS: [string, string][] = [['(', ')'], ['[', ']'], ['{', '}']]
const MATCH = new Map(PAIRS)
const OPEN = new Set(MATCH.keys())
const CLOSE = new Set(MATCH.values())

function findUnmatchedBrackets(doc: Text): number[] {
  const stack: { char: string, pos: number }[] = []
  const unmatched: number[] = []
  let offset = 0

  const iter = doc.iter()
  while (!iter.next().done) {
    const chunk = iter.value
    for (let i = 0; i < chunk.length; i++) {
      const ch = chunk[i]
      if (OPEN.has(ch)) {
        stack.push({ char: ch, pos: offset + i })
      }
      else if (CLOSE.has(ch)) {
        const top = stack.at(-1)
        if (top && MATCH.get(top.char) === ch) {
          stack.pop()
        }
        else {
          unmatched.push(offset + i)
        }
      }
    }
    offset += chunk.length
  }

  for (const { pos } of stack) unmatched.push(pos)
  return unmatched.sort((a, b) => a - b)
}

const unmatchedDecoration = Decoration.mark({ class: 'cm-nonmatchingBracket' })

function buildDecorations(doc: Text): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  for (const pos of findUnmatchedBrackets(doc)) {
    builder.add(pos, pos + 1, unmatchedDecoration)
  }
  return builder.finish()
}

export const nonMatchingBracketPlugin: Extension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view.state.doc)
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = buildDecorations(update.state.doc)
      }
    }
  },
  { decorations: v => v.decorations },
)
