import { resolve } from 'node:path'

const r = (p: string) => resolve(__dirname, p)

export const aliasEngine: Record<string, string> = {
  '@sohne/shader.vista': r('./packages-engine/core/src/index.ts'),
  '@sohne/shader.vista-config': r('./packages-engine/config/src/index.ts'),
}
