import type Pass from '../../pass/Pass'
import type { PipelineRegistry, PipelineSorter } from '../../types'

type DependencyGraph = {
  readonly inDegree: Map<string, number>
  readonly adjacency: Map<string, string[]>
}

export default class KahnPipelineSorter implements PipelineSorter {
  sort(registry: PipelineRegistry): Pass[] {
    const entries = registry.getAll()
    const graph = this.buildGraph(entries, registry)
    return this.topoSort(entries, graph, registry)
  }

  private buildGraph(
    entries: ReturnType<PipelineRegistry['getAll']>,
    registry: PipelineRegistry,
  ): DependencyGraph {
    const inDegree = new Map<string, number>()
    const adjacency = new Map<string, string[]>()

    // Seed every known node first so all keys exist before the edge-building
    for (const entry of entries) {
      inDegree.set(entry.name, 0)
      adjacency.set(entry.name, [])
    }

    for (const entry of entries) {
      for (const dep of entry.dependencies) {
        if (!registry.has(dep)) {
          throw new Error(
            `Pass "${entry.name}" depends on "${dep}", which is not registered`,
          )
        }

        // Edge direction: dependency -> dependent (reversed from intuition so
        // we can walk "what does this unlock?" during the BFS below)
        adjacency.get(dep)!.push(entry.name)
        inDegree.set(entry.name, inDegree.get(entry.name)! + 1)
      }
    }

    return { inDegree, adjacency }
  }

  private topoSort(
    entries: ReturnType<PipelineRegistry['getAll']>,
    { inDegree, adjacency }: DependencyGraph,
    registry: PipelineRegistry,
  ): Pass[] {
    // Kahn's algorithm: start from all nodes with no incoming edges
    const queue = entries
      .filter(entry => inDegree.get(entry.name) === 0)
      .map(entry => entry.name)

    const ordered: Pass[] = []

    while (queue.length > 0) {
      const name = queue.shift() as string

      const entry = registry.get(name)
      if (entry === undefined) {
        throw new Error(
          `Internal error: pass "${name}" is referenced in the graph but missing from the registry`,
        )
      }

      ordered.push(entry.pass)

      // Removing this node decrements the in-degree of every node it points to;
      // any that reach zero are now dependency-free and can be enqueued
      for (const dependent of adjacency.get(name) ?? []) {
        const nextDegree = inDegree.get(dependent)! - 1
        inDegree.set(dependent, nextDegree)

        if (nextDegree === 0) {
          queue.push(dependent)
        }
      }
    }

    // In an acyclic graph every node is eventually reachable from a zero-in-degree
    // root, so a count mismatch means at least one cycle kept some nodes enqueued
    if (ordered.length !== entries.length) {
      const cyclic = entries
        .map(entry => entry.name)
        .filter(name => (inDegree.get(name) ?? 0) > 0) // still-positive → never unlocked
      throw new Error(
        `Pipeline contains a cyclic dependency among: ${cyclic.join(', ')}`,
      )
    }

    return ordered
  }
}
