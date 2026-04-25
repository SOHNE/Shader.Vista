import type { CompletionSource } from '@codemirror/autocomplete'
import type { Extension } from '@codemirror/state'
import type { ViewUpdate } from '@codemirror/view'
import type { GlslCompletionOptions } from './plugin/completions'
import { autocompletion } from '@codemirror/autocomplete'
import { cpp } from '@codemirror/lang-cpp'
import { scrollPastEnd as codemirrorScrollPastEnd, EditorView } from '@codemirror/view'
import { basicSetup as codemirrorBasicSetup } from 'codemirror'
import { nonMatchingBracketPlugin } from './plugin/bracket-match'
import { glslCompletions } from './plugin/completions'
import { codeFoldingExtension } from './plugin/folding'
import { scrollbarRulerExtension } from './plugin/scrollbar'
import { selectionLineHighlightPlugin } from './plugin/selection'
import { vitesse } from './plugin/theme'
import { wordHighlightExtension } from './plugin/word-highlight'

export const actisCodeMirrorClassName = 'cm-actis-editor'

export type GlslEditorExtensionOptions = GlslCompletionOptions & {
  basicSetup?: Extension | false
  completionSource?: CompletionSource | false
  folding?: boolean
  language?: Extension | false
  nonMatchingBrackets?: boolean
  onChange?: (value: string, update: ViewUpdate) => void
  scrollbar?: boolean
  scrollPastEnd?: boolean
  selectionLineHighlight?: boolean
  theme?: Extension | false
  wordHighlight?: boolean
}

export function glslLanguage(): Extension {
  return cpp()
}

export function glslEditorExtensions(options: GlslEditorExtensionOptions = {}): Extension[] {
  const extensions: Extension[] = []

  const basicSetup = options.basicSetup === undefined
    ? codemirrorBasicSetup
    : options.basicSetup
  if (basicSetup !== false) {
    extensions.push(basicSetup)
  }

  const language = options.language === undefined
    ? glslLanguage()
    : options.language
  if (language !== false) {
    extensions.push(language)
  }

  const theme = options.theme === undefined
    ? vitesse
    : options.theme
  if (theme !== false) {
    extensions.push(theme)
  }

  if (options.nonMatchingBrackets !== false) {
    extensions.push(nonMatchingBracketPlugin)
  }

  if (options.wordHighlight !== false) {
    extensions.push(wordHighlightExtension())
  }

  if (options.selectionLineHighlight !== false) {
    extensions.push(selectionLineHighlightPlugin)
  }

  if (options.scrollbar !== false) {
    extensions.push(scrollbarRulerExtension())
  }

  if (options.scrollPastEnd !== false) {
    extensions.push(codemirrorScrollPastEnd())
  }

  if (options.folding !== false) {
    extensions.push(codeFoldingExtension())
  }

  const completionSource = options.completionSource === undefined
    ? glslCompletions(options)
    : options.completionSource
  if (completionSource !== false) {
    extensions.push(autocompletion({
      activateOnTyping: true,
      override: [completionSource],
    }))
  }

  if (options.onChange) {
    extensions.push(EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        options.onChange?.(update.state.doc.toString(), update)
      }
    }))
  }

  return extensions
}
