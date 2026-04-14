import type { AttachmentOptions } from 'twgl.js'
import type { GL, GLContextCapabilities } from '../types/gl'
import type { TextureFilterMode, TextureOptions, TextureWrapMode } from '../types/texture'
import { resolveFramebufferAttachmentOptions } from '../fbo/FramebufferAttachmentSupport'

type TextureFilterKey = Exclude<TextureFilterMode, number>
type TextureWrapKey = Exclude<TextureWrapMode, number>

export type TextureFramebufferAttachmentOptions = AttachmentOptions

export function getTextureFramebufferAttachmentOptions(
  gl: GL,
  capabilities: GLContextCapabilities,
  options: Readonly<TextureOptions>,
): TextureFramebufferAttachmentOptions {
  const {
    auto,
    generateMipmaps,
    mag,
    magFilter,
    min,
    minFilter,
    minMag,
    wrap,
    wrapS,
    wrapT,
    ...rest
  } = options

  const resolvedMag = resolveTextureFilter(gl, mag ?? magFilter)
  const resolvedMin = resolveTextureFilter(gl, min ?? minFilter)
  const resolvedMinMag = resolveTextureFilter(gl, minMag)
  const resolvedWrap = resolveTextureWrap(gl, wrap)
  const resolvedWrapS = resolveTextureWrap(gl, wrapS)
  const resolvedWrapT = resolveTextureWrap(gl, wrapT)
  const shouldDefaultToFloatType = rest.type === undefined
    && rest.attachment === undefined
    && rest.internalFormat === undefined
    && (rest.format === undefined || rest.format === gl.RGBA)

  return resolveFramebufferAttachmentOptions(gl, capabilities, {
    ...rest,
    auto: auto ?? generateMipmaps,
    ...(shouldDefaultToFloatType && { type: gl.FLOAT }),
    ...(resolvedMag !== undefined && { mag: resolvedMag }),
    ...(resolvedMin !== undefined && { min: resolvedMin }),
    ...(resolvedMinMag !== undefined && { minMag: resolvedMinMag }),
    ...(resolvedWrap !== undefined && { wrap: resolvedWrap }),
    ...(resolvedWrapS !== undefined && { wrapS: resolvedWrapS }),
    ...(resolvedWrapT !== undefined && { wrapT: resolvedWrapT }),
  })
}

export function shouldUpdateTextureFiltering(options: Readonly<TextureOptions>): boolean {
  return (options.auto ?? options.generateMipmaps) === true
}

function resolveTextureFilter(gl: GL, filter: TextureFilterMode | undefined): number | undefined {
  if (filter === undefined)
    return undefined
  if (typeof filter === 'number')
    return filter

  const filterMap = {
    'nearest': gl.NEAREST,
    'linear': gl.LINEAR,
    'nearest-mipmap-nearest': gl.NEAREST_MIPMAP_NEAREST,
    'linear-mipmap-nearest': gl.LINEAR_MIPMAP_NEAREST,
    'nearest-mipmap-linear': gl.NEAREST_MIPMAP_LINEAR,
    'linear-mipmap-linear': gl.LINEAR_MIPMAP_LINEAR,
  } satisfies Record<TextureFilterKey, number>

  return filterMap[filter] ?? gl.LINEAR
}

function resolveTextureWrap(gl: GL, wrap: TextureWrapMode | undefined): number | undefined {
  if (wrap === undefined)
    return undefined
  if (typeof wrap === 'number')
    return wrap

  const wrapMap = {
    'repeat': gl.REPEAT,
    'mirrored-repeat': gl.MIRRORED_REPEAT,
    'clamp-to-edge': gl.CLAMP_TO_EDGE,
  } satisfies Record<TextureWrapKey, number>

  return wrapMap[wrap] ?? gl.CLAMP_TO_EDGE
}
