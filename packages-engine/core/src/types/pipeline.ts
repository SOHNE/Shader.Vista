import type Pass from '../pass/Pass'
import type { PassConfig, RendererConfig } from './renderer'

export type PipelineEntry = {
  dependencies: string[]
  name: string
  pass: Pass
}

export type ResolvedPassConfig = Omit<PassConfig, 'pingPong' | 'textures'> & {
  dependencies: string[]
  offscreen: boolean
  pingPong: boolean
  presentToCanvas: boolean
  textures: string[]
}

export type PipelinePlan = {
  passes: ResolvedPassConfig[]
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

export type PipelineConfigCompiler = {
  compile: (config: RendererConfig) => PipelinePlan
}
