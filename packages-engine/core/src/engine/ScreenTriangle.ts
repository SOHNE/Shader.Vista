import type { Arrays, BufferInfo } from 'twgl.js'
import type { GL } from '../types/gl'
import {
  createBufferInfoFromArrays,
} from 'twgl.js'

const triangleCache = new WeakMap<GL, BufferInfo>()

/**
 * Provides a cached full-screen triangle (Screen Triangle) BufferInfo.
 *
 * Uses a single large triangle instead of a two-triangle quad for full-screen passes.
 * This improves cache coherency by maintaining spatial locality during rasterization,
 * avoiding the cache invalidation that occurs when switching between quad triangles.
 *
 * Vertices are at (-1, -1), (-1, 3), (3, -1) in clip space, covering the viewport
 * after clipping.
 *
 * @see {@link https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/}
 */
export function getScreenTriangle(gl: GL): BufferInfo {
  let bufferInfo = triangleCache.get(gl)

  // Create vertex array object
  if (!bufferInfo) {
    const arrays: Arrays = {
      a_position: {
        numComponents: 2,
        data: new Float32Array([
          -1,
          -1,
          -1,
          3,
          3,
          -1,
        ]),

      },
    }

    bufferInfo = createBufferInfoFromArrays(gl, arrays)
    triangleCache.set(gl, bufferInfo)
  }

  return bufferInfo
}
