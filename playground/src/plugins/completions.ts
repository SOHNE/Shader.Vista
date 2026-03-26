import type { Completion, CompletionContext } from '@codemirror/autocomplete'
import { snippetCompletion } from '@codemirror/autocomplete'

export type GlslCompletionOptions = {
  webgl2?: boolean
}

const WEBGL_KEYWORDS = [
  'precision',
  'lowp',
  'mediump',
  'highp',
  'attribute',
  'uniform',
  'varying',
  'break',
  'continue',
  'do',
  'for',
  'while',
  'if',
  'else',
  'float',
  'int',
  'void',
  'bool',
  'mat2',
  'mat3',
  'mat4',
  'vec2',
  'vec3',
  'vec4',
  'ivec2',
  'ivec3',
  'ivec4',
  'bvec2',
  'bvec3',
  'bvec4',
  'sampler2D',
  'samplerCube',
  'struct',
  'discard',
  'return',
]

const WEBGL2_KEYWORDS = [
  'layout',
  'flat',
  'smooth',
  'noperspective',
  'switch',
  'case',
  'default',
  'uint',
  'uvec2',
  'uvec3',
  'uvec4',
  'mat2x2',
  'mat2x3',
  'mat2x4',
  'mat3x2',
  'mat3x3',
  'mat3x4',
  'mat4x2',
  'mat4x3',
  'mat4x4',
  'isampler2D',
  'isampler3D',
  'isamplerCube',
  'usampler2D',
  'usampler3D',
  'usamplerCube',
]

const SNIPPETS = [
  {
    label: 'main',
    detail: 'main entry point',
    type: 'function',

    template: 'void main() {\n\t${}\n\tgl_FragColor = vec4(1.0);\n}',
  },
  {
    label: 'for',
    detail: 'for loop',
    type: 'keyword',
    // eslint-disable-next-line no-template-curly-in-string
    template: 'for (int i = 0; i < ${count}; i++) {\n\t${}\n}',
  },
]

const WORD_PATTERN = /\w*/

export function glslCompletions(options: GlslCompletionOptions = {}) {
  const keywords = [...WEBGL_KEYWORDS, ...(options.webgl2 ? WEBGL2_KEYWORDS : [])]

  const completions: Completion[] = [
    ...keywords.map(kw => ({ label: kw, type: 'keyword' })),
    ...SNIPPETS.map(s => snippetCompletion(s.template, {
      label: s.label,
      detail: s.detail,
      type: s.type,
    })),
  ]

  return (context: CompletionContext) => {
    const word = context.matchBefore(WORD_PATTERN)
    if (!word || (word.from === word.to && !context.explicit))
      return null

    return {
      from: word.from,
      options: completions,
    }
  }
}
