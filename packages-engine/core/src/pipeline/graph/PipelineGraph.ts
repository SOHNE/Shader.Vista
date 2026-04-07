import type { PipelineEntry, PipelineRegistry } from '../../types'

export default class PipelineGraph implements PipelineRegistry {
  private readonly entries = new Map<string, PipelineEntry>()

  add(entry: PipelineEntry): void {
    if (this.entries.has(entry.name)) {
      throw new Error(`Pass "${entry.name}" is already registered`)
    }

    // isolates stored state from mutations
    this.entries.set(entry.name, {
      ...entry,
      dependencies: [...entry.dependencies],
    })
  }

  clear(): void {
    this.entries.clear()
  }

  get(name: string): PipelineEntry | undefined {
    const entry = this.entries.get(name)
    if (entry === undefined)
      return undefined

    // prevents callers from mutating internal state
    return { ...entry, dependencies: [...entry.dependencies] }
  }

  getAll(): PipelineEntry[] {
    return [...this.entries.values()]
  }

  has(name: string): boolean {
    return this.entries.has(name)
  }
}
