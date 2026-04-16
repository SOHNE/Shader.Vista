import type Texture from '../texture/Texture'
import type {
  ShaderUniformMap,
  UniformContext,
  UniformContextTarget,
  UniformProvider,
} from '../types'

type UniformRuntimeSnapshot = Readonly<{
  frame: number
  frameRate: number
  mouse: readonly [number, number]
  now: Date
  time: number
  timeDelta: number
}>

type UniformRuntimeSnapshotProvider = () => UniformRuntimeSnapshot

type UniformResolutionRequest = Readonly<{
  passName: string
  resolution: readonly [number, number]
  target: UniformContextTarget
  textures?: readonly Texture[]
}>

const DATE_UNIFORM_PROVIDER: UniformProvider = {
  id: 'uniform:date',
  resolve: context => ({
    u_date: context.date,
  }),
}

const FRAME_UNIFORM_PROVIDER: UniformProvider = {
  id: 'uniform:frame',
  resolve: context => ({
    u_frame: context.frame,
    u_frameRate: context.frameRate,
    u_time: context.time,
    u_timeDelta: context.timeDelta,
  }),
}

const RESOLUTION_UNIFORM_PROVIDER: UniformProvider = {
  id: 'uniform:resolution',
  resolve: context => ({
    u_resolution: context.resolution,
  }),
}

const MOUSE_UNIFORM_PROVIDER: UniformProvider = {
  id: 'uniform:mouse',
  resolve: context => ({
    u_mouse: context.mouse,
  }),
}

const TEXTURE_UNIFORM_PROVIDER: UniformProvider = {
  id: 'uniform:textures',
  resolve: ({ textures }) => {
    if (textures.length === 0) {
      return undefined
    }

    return textures.reduce<ShaderUniformMap>((uniforms, texture, index) => {
      if (texture.handle) {
        uniforms[`u_texture${index}`] = texture.handle
      }
      return uniforms
    }, {})
  },
}

/**
 * Resolves shader uniforms through a composable provider pipeline.
 * Later providers override earlier values, which keeps the default set extensible.
 */
export default class UniformManager {
  private readonly providers: Map<string, UniformProvider>
  private readonly runtimeStateProvider: UniformRuntimeSnapshotProvider

  constructor(
    runtimeStateProvider: UniformRuntimeSnapshotProvider = UniformManager.createDefaultRuntimeSnapshot,
    providers: readonly UniformProvider[] = UniformManager.createDefaultProviders(),
  ) {
    this.providers = new Map()
    this.runtimeStateProvider = runtimeStateProvider
    providers.forEach(provider => this.registerProvider(provider))
  }

  private static createDefaultProviders(): UniformProvider[] {
    return [
      DATE_UNIFORM_PROVIDER,
      FRAME_UNIFORM_PROVIDER,
      RESOLUTION_UNIFORM_PROVIDER,
      MOUSE_UNIFORM_PROVIDER,
      TEXTURE_UNIFORM_PROVIDER,
    ]
  }

  private static createDefaultRuntimeSnapshot(): UniformRuntimeSnapshot {
    return {
      now: new Date(0),
      frame: 0,
      frameRate: 0,
      mouse: [0, 0],
      time: 0,
      timeDelta: 0,
    }
  }

  public registerProvider(provider: UniformProvider): void {
    const id = provider.id.trim()
    if (!id) {
      throw new Error('Uniform provider id must not be empty')
    }

    if (typeof provider.resolve !== 'function') {
      throw new TypeError(`Uniform provider "${id}" must define a resolve function`)
    }

    if (this.providers.has(id)) {
      throw new Error(`Uniform provider "${id}" is already registered`)
    }

    this.providers.set(id, {
      ...provider,
      id,
    })
  }

  public unregisterProvider(id: string): boolean {
    return this.providers.delete(id.trim())
  }

  public resolve(request: UniformResolutionRequest): ShaderUniformMap {
    const context = this.createContext(request)
    const uniforms: ShaderUniformMap = {}

    for (const provider of this.providers.values()) {
      const resolvedUniforms = this.resolveProvider(provider, context)
      if (!resolvedUniforms) {
        continue
      }

      Object.assign(uniforms, resolvedUniforms)
    }

    return uniforms
  }

  private resolveProvider(
    provider: UniformProvider,
    context: UniformContext,
  ): ShaderUniformMap | undefined {
    try {
      const resolvedUniforms = provider.resolve(context)
      if (resolvedUniforms === undefined) {
        return undefined
      }

      if (!this.isUniformMap(resolvedUniforms)) {
        throw new Error('Uniform provider must return an object map or undefined')
      }

      return resolvedUniforms
    }
    catch (error: unknown) {
      throw new Error(
        `Failed to resolve uniforms for provider "${provider.id}" on ${context.target} `
        + `"${context.passName}": ${this.toErrorMessage(error)}`,
      )
    }
  }

  private isUniformMap(value: unknown): value is ShaderUniformMap {
    return value !== null && !Array.isArray(value) && typeof value === 'object'
  }

  private createContext(request: UniformResolutionRequest): UniformContext {
    const runtimeState = this.getRuntimeState()
    const passName = request.passName.trim()
    if (!passName) {
      throw new Error('Uniform request passName must not be empty')
    }

    if (!this.isTarget(request.target)) {
      throw new Error(`Uniform request target "${String(request.target)}" is invalid`)
    }

    return {
      target: request.target,
      passName,
      date: this.toDateUniformValue(runtimeState.now),
      frame: runtimeState.frame,
      frameRate: runtimeState.frameRate,
      mouse: this.clonePair(runtimeState.mouse, 'runtime mouse'),
      resolution: this.clonePair(request.resolution, 'uniform resolution'),
      textures: [...(request.textures ?? [])],
      time: runtimeState.time,
      timeDelta: runtimeState.timeDelta,
    }
  }

  private getRuntimeState(): UniformRuntimeSnapshot {
    const runtimeState = this.runtimeStateProvider()

    if (!this.isRuntimeState(runtimeState)) {
      throw new Error('Uniform runtime state provider returned an invalid state object')
    }

    return runtimeState
  }

  private isRuntimeState(value: unknown): value is UniformRuntimeSnapshot {
    if (value === null || typeof value !== 'object') {
      return false
    }

    const runtimeState = value as Partial<UniformRuntimeSnapshot>
    return runtimeState.now instanceof Date
      && this.isNumber(runtimeState.frame)
      && this.isNumber(runtimeState.frameRate)
      && this.isPair(runtimeState.mouse)
      && this.isNumber(runtimeState.time)
      && this.isNumber(runtimeState.timeDelta)
  }

  private isTarget(value: unknown): value is UniformContextTarget {
    return value === 'pass' || value === 'present'
  }

  private isPair(value: unknown): value is readonly [number, number] {
    return Array.isArray(value)
      && value.length === 2
      && this.isNumber(value[0])
      && this.isNumber(value[1])
  }

  private isNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value)
  }

  private clonePair(
    value: readonly [number, number],
    label: string,
  ): [number, number] {
    if (!this.isPair(value)) {
      throw new Error(`${label} must be a pair of finite numbers`)
    }

    return [value[0], value[1]]
  }

  private toDateUniformValue(now: Date): [number, number, number, number] {
    return [
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      now.getHours() * 3600
      + now.getMinutes() * 60
      + now.getSeconds()
      + now.getMilliseconds() / 1000,
    ]
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }

    return String(error)
  }
}
