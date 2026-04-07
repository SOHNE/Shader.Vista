import type Pass from '../pass/Pass'

export type PipelineEntry = {
  dependencies: string[]
  name: string
  pass: Pass
}

export type PipelineRegistry = {
  add: (entry: PipelineEntry) => void
  clear: () => void
  get: (name: string) => PipelineEntry | undefined
  getAll: () => PipelineEntry[]
  has: (name: string) => boolean
}

export type PipelineSorter = {
  sort: (registry: PipelineRegistry) => Pass[]
}
