import type {
  PassConfig,
  PipelineConfigCompiler,
  PipelinePlan,
  RendererConfig,
  ResolvedPassConfig,
} from '../types'

type PlannedPassConfig = Omit<ResolvedPassConfig, 'offscreen' | 'presentToCanvas'>
type CanvasPassScore = {
  upstreamCount: number
  depth: number
  declarationIndex: number
}

export default class PipelineCompiler implements PipelineConfigCompiler {
  compile(config: RendererConfig): PipelinePlan {
    if (config.passes.length === 0) {
      return { passes: [] }
    }

    const plannedPasses = config.passes.map(passConfig => this.planPassConfig(passConfig))
    const canvasPassName = this.resolveCanvasPassName(plannedPasses)

    return {
      passes: plannedPasses.map(passConfig => this.resolveRenderTarget(passConfig, canvasPassName)),
    }
  }

  private planPassConfig(passConfig: PassConfig): PlannedPassConfig {
    const textures = [...passConfig.textures]

    return {
      ...passConfig,
      textures,
      dependencies: [...new Set(textures.filter(textureName =>
        textureName !== '' && textureName !== passConfig.name,
      ))],
      pingPong: textures.includes(passConfig.name) || Boolean(passConfig.pingPong),
    }
  }

  private resolveCanvasPassName(passConfigs: PlannedPassConfig[]): string {
    const passConfigsByName = new Map(
      passConfigs.map(passConfig => [passConfig.name, passConfig]),
    )
    const declarationIndexByName = new Map(
      passConfigs.map((passConfig, index) => [passConfig.name, index]),
    )
    const dependentsByName = new Map<string, string[]>(
      passConfigs.map(passConfig => [passConfig.name, []]),
    )

    for (const passConfig of passConfigs) {
      for (const dependency of passConfig.dependencies) {
        const dependents = dependentsByName.get(dependency)
        if (!dependents || !passConfigsByName.has(dependency)) {
          throw new Error(
            `Pass "${passConfig.name}" depends on "${dependency}", which is not registered`,
          )
        }
        dependents.push(passConfig.name)
      }
    }

    const canvasPasses = passConfigs
      .filter(passConfig => (dependentsByName.get(passConfig.name)?.length ?? 0) === 0)
      .map(passConfig => passConfig.name)

    if (canvasPasses.length === 0) {
      throw new Error(
        'Pipeline must contain at least one terminal pass that can be presented to the canvas.',
      )
    }

    if (canvasPasses.length === 1) {
      return canvasPasses[0]
    }

    const upstreamMemo = new Map<string, Set<string>>()
    const depthMemo = new Map<string, number>()

    return canvasPasses
      .map(name => ({
        name,
        score: this.scoreCanvasPass(
          name,
          declarationIndexByName.get(name)!,
          passConfigsByName,
          upstreamMemo,
          depthMemo,
        ),
      }))
      .sort((left, right) => this.compareCanvasPassScore(right.score, left.score))[0]
      .name
  }

  private resolveRenderTarget(
    passConfig: PlannedPassConfig,
    canvasPassName: string,
  ): ResolvedPassConfig {
    const presentToCanvas = passConfig.name === canvasPassName
    const offscreen = !presentToCanvas || passConfig.pingPong

    return {
      ...passConfig,
      offscreen,
      presentToCanvas,
    }
  }

  private scoreCanvasPass(
    passName: string,
    declarationIndex: number,
    passConfigsByName: Map<string, PlannedPassConfig>,
    upstreamMemo: Map<string, Set<string>>,
    depthMemo: Map<string, number>,
  ): CanvasPassScore {
    const upstreamPasses = this.collectUpstreamPasses(passName, passConfigsByName, new Set(), upstreamMemo)

    return {
      upstreamCount: upstreamPasses.size,
      depth: this.computeDependencyDepth(passName, passConfigsByName, new Set(), depthMemo),
      declarationIndex,
    }
  }

  private collectUpstreamPasses(
    passName: string,
    passConfigsByName: Map<string, PlannedPassConfig>,
    visiting: Set<string>,
    memo: Map<string, Set<string>>,
  ): Set<string> {
    const memoized = memo.get(passName)
    if (memoized) {
      return memoized
    }

    const passConfig = passConfigsByName.get(passName)
    if (!passConfig) {
      throw new Error(`Pass "${passName}" is not registered`)
    }

    if (visiting.has(passName)) {
      throw new Error(`Pipeline contains a cyclic dependency involving "${passName}"`)
    }

    visiting.add(passName)

    const upstreamPasses = new Set<string>()
    for (const dependency of passConfig.dependencies) {
      upstreamPasses.add(dependency)

      for (const ancestor of this.collectUpstreamPasses(
        dependency,
        passConfigsByName,
        visiting,
        memo,
      )) {
        upstreamPasses.add(ancestor)
      }
    }

    visiting.delete(passName)
    memo.set(passName, upstreamPasses)

    return upstreamPasses
  }

  private computeDependencyDepth(
    passName: string,
    passConfigsByName: Map<string, PlannedPassConfig>,
    visiting: Set<string>,
    memo: Map<string, number>,
  ): number {
    const memoized = memo.get(passName)
    if (memoized !== undefined) {
      return memoized
    }

    const passConfig = passConfigsByName.get(passName)
    if (!passConfig) {
      throw new Error(`Pass "${passName}" is not registered`)
    }

    if (visiting.has(passName)) {
      throw new Error(`Pipeline contains a cyclic dependency involving "${passName}"`)
    }

    visiting.add(passName)

    let depth = 0
    for (const dependency of passConfig.dependencies) {
      depth = Math.max(
        depth,
        1 + this.computeDependencyDepth(dependency, passConfigsByName, visiting, memo),
      )
    }

    visiting.delete(passName)
    memo.set(passName, depth)

    return depth
  }

  private compareCanvasPassScore(left: CanvasPassScore, right: CanvasPassScore): number {
    if (left.upstreamCount !== right.upstreamCount) {
      return left.upstreamCount - right.upstreamCount
    }

    if (left.depth !== right.depth) {
      return left.depth - right.depth
    }

    return left.declarationIndex - right.declarationIndex
  }
}
