import type Pass from '../pass/Pass'
import type {
  PipelineRegistry,
  PipelineSorter,
} from '../types'
import KahnPipelineSorter from './graph/KahnPipelineSorter'
import PipelineGraph from './graph/PipelineGraph'

/**
 * Orchestrates pass storage and dependency resolution for the render graph
 */
export default class Pipeline {
  private orderedPasses: Pass[] = []
  private dirty = false

  constructor(
    private readonly registry: PipelineRegistry = new PipelineGraph(),
    private readonly sorter: PipelineSorter = new KahnPipelineSorter(),
  ) { }

  add(name: string, pass: Pass, dependencies: string[] = []): void {
    const sanitizedDependencies = dependencies.filter((dependency) => {
      if (dependency !== name) {
        return true
      }

      if (pass.pingPong) {
        return false
      }

      throw new Error(
        `Pass "${name}" samples itself and requires pingPong to read the previous frame`,
      )
    })

    this.registry.add({
      name,
      pass,
      dependencies: sanitizedDependencies,
    })
    this.dirty = true
  }

  clear(): void {
    this.registry.clear()
    this.orderedPasses = []
    this.dirty = false
  }

  resize(width: number, height: number): void {
    this.forEach((pass) => {
      pass.resize(width, height)
    })
  }

  forEach(callback: (pass: Pass) => void): void {
    for (const pass of this.getOrderedPasses()) {
      callback(pass)
    }
  }

  get(name: string): Pass | undefined {
    return this.registry.get(name)?.pass
  }

  toArray(): Pass[] {
    return [...this.getOrderedPasses()]
  }

  private getOrderedPasses(): Pass[] {
    if (this.dirty) {
      this.orderedPasses = this.sorter.sort(this.registry)
      this.dirty = false
    }

    return this.orderedPasses
  }
}
