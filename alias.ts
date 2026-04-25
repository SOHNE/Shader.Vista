import { resolve } from 'node:path'

const r = (p: string) => resolve(__dirname, p)

export const aliasEngine: Record<string, string> = {
  '@actis/core': r('./packages-engine/core/src/index.ts'),
  '@actis/codemirror/styles.css': r('./package-integrations/codemirror/styles.css'),
  '@actis/codemirror': r('./package-integrations/codemirror/src/index.ts'),
}
