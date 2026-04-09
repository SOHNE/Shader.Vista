import type { AttachmentOptions as TwglAttachmentOptions } from 'twgl.js'

export type TextureWrapMode
  = number
    | 'clamp-to-edge'
    | 'repeat'
    | 'mirrored-repeat'

export type TextureFilterMode
  = number
    | 'nearest'
    | 'linear'
    | 'nearest-mipmap-nearest'
    | 'linear-mipmap-nearest'
    | 'nearest-mipmap-linear'
    | 'linear-mipmap-linear'

export type TextureOptions = Omit<
  TwglAttachmentOptions,
  'auto' | 'mag' | 'min' | 'minMag' | 'wrap' | 'wrapS' | 'wrapT'
> & {
  auto?: boolean
  generateMipmaps?: boolean
  mag?: TextureFilterMode
  magFilter?: TextureFilterMode
  min?: TextureFilterMode
  minFilter?: TextureFilterMode
  minMag?: TextureFilterMode
  wrap?: TextureWrapMode
  wrapS?: TextureWrapMode
  wrapT?: TextureWrapMode
}
