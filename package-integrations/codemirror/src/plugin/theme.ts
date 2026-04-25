import type { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const keyword = 'var(--cm-keyword)'
const property = 'var(--cm-property)'
const punctuation = 'var(--cm-punctuation)'
const invalid = 'var(--cm-invalid, #ffffff)'
const foreground = 'var(--cm-foreground)'
const lineNumber = 'var(--cm-line-number)'
const comment = 'var(--cm-comment)'
const variable = 'var(--cm-variable)'
const string = 'var(--cm-string)'
const darkBackground = 'var(--cm-background)'
const highlightBackground = 'var(--cm-line-highlight-background)'
const background = 'var(--cm-background)'
const tooltipBackground = 'var(--cm-tooltip-background)'
const selection = 'var(--cm-selection-background)'
const border = 'var(--cm-border)'
const cursor = 'var(--cm-cursor, #888)'

export const vitesseTheme: Extension = EditorView.theme({
  '&': {
    color: foreground,
    backgroundColor: background,
    fontFamily: 'var(--cm-font-family)',
    fontSize: 'var(--cm-font-size, 14px)',
    lineHeight: 'var(--cm-line-height, 1.6)',
    fontVariantLigatures: 'var(--cm-font-ligatures, normal)',
    fontFeatureSettings: 'var(--cm-font-feature-settings, "calt" 1)',
  },
  '& div': {
    flexDirection: 'initial',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-content': {
    caretColor: cursor,
  },
  '.cm-completionIcon': {
    display: 'none',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursor },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: `${selection} !important` },
  '.cm-panels': { backgroundColor: darkBackground, color: foreground },
  '.cm-panels.cm-panels-top': { borderBottom: '1px solid var(--cm-border)' },
  '.cm-panels.cm-panels-bottom': { borderTop: '1px solid var(--cm-border)' },
  '.cm-searchMatch': {
    backgroundColor: 'var(--cm-search-match-background, #72a1ff59)',
    outline: '1px solid var(--cm-search-match-outline, #457dff)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'var(--cm-search-match-selected-background, #6199ff2f)',
  },
  '.cm-line': {
    border: '1px solid transparent',
    lineHeight: 'inherit',
  },
  '.cm-activeLine': { backgroundColor: highlightBackground, border: '1px solid var(--cm-line-highlight-border)' },
  '.cm-selectionMatch': { backgroundColor: 'var(--cm-selection-match-background, #aafe661a)' },
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: 'var(--cm-matching-bracket-background)',
    textDecoration: 'underline',
    textUnderlineOffset: 'var(--cm-bracket-underline-offset, 2px)',
  },
  '&.cm-focused .cm-nonmatchingBracket': {
    backgroundColor: 'var(--cm-nonmatching-bracket-background)',
    outline: '1px solid color-mix(in srgb, var(--cm-nonmatching-bracket-background), white 25%)',
    borderRadius: '2px',
  },
  '.cm-gutters': {
    backgroundColor: background,
    color: lineNumber,
    border: 'none',
    fontFamily: 'var(--cm-font-family)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--cm-active-line-gutter, #bfbaaa)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--cm-fold-placeholder-color, #ddd)',
  },
  '.cm-tooltip': {
    border: `1px solid ${border}`,
    borderRadius: '4px',
    backgroundColor: tooltipBackground,
    color: 'var(--cm-tooltip-foreground, #c2beb3)',
    fontFamily: 'var(--cm-font-family)',
  },
  '.cm-tooltip .cm-tooltip-arrow:before': {
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  '.cm-tooltip .cm-tooltip-arrow:after': {
    borderTopColor: tooltipBackground,
    borderBottomColor: tooltipBackground,
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: selection,
      color: 'var(--cm-tooltip-foreground, #c2beb3)',
    },
  },
}, { dark: true })

export const vitesseHighlightStyle = HighlightStyle.define([
  {
    tag: [t.variableName, t.regexp],
    color: 'var(--cm-decorator)',
  },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: property,
  },
  {
    tag: [t.function(t.variableName), t.labelName],
    color: variable,
  },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: 'var(--cm-constant, #c99076)',
  },
  {
    tag: [t.definition(t.name), t.separator],
    color: foreground,
  },
  {
    tag: [t.angleBracket],
    color: 'var(--cm-angle-bracket, #666666)',
  },
  {
    tag: [t.brace],
    color: 'var(--cm-brace, #5eaab5)',
  },
  {
    tag: [t.bracket],
    color: 'var(--cm-bracket, #4d9375)',
  },
  {
    tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace, t.keyword, t.atom, t.bool, t.special(t.variableName)],
    color: keyword,
  },
  {
    tag: [t.definitionKeyword],
    color: 'var(--cm-definition-keyword)',
  },
  {
    tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.link, t.special(t.string)],
    color: punctuation,
  },
  {
    tag: [t.meta, t.comment],
    color: comment,
  },
  {
    tag: t.strong,
    fontWeight: 'var(--cm-font-weight-bold, bold)',
  },
  {
    tag: t.emphasis,
    fontStyle: 'var(--cm-font-style-italic, italic)',
  },
  {
    tag: t.strikethrough,
    textDecoration: 'line-through',
  },
  {
    tag: t.link,
    color: lineNumber,
    textDecoration: 'underline',
  },
  {
    tag: t.heading,
    fontWeight: 'var(--cm-font-weight-bold, bold)',
    color: property,
  },
  {
    tag: [t.processingInstruction, t.string, t.inserted],
    color: string,
  },
  {
    tag: t.invalid,
    color: invalid,
  },
])

export const vitesse: Extension = [vitesseTheme, syntaxHighlighting(vitesseHighlightStyle)]
