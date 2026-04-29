import type { Plugin, ViteDevServer } from 'vite'
import { fileURLToPath } from 'node:url'
import { build as buildWithEsbuild } from 'esbuild'

const ACTIS_CORE_BUNDLE_MODULE_ID = 'virtual:actis-core-bundle'
const RESOLVED_ACTIS_CORE_BUNDLE_MODULE_ID = `\0${ACTIS_CORE_BUNDLE_MODULE_ID}`
const ACTIS_CORE_ENTRY_POINT = fileURLToPath(new URL('../../packages-engine/core/src/index.ts', import.meta.url))
const ACTIS_CORE_SRC_DIR = fileURLToPath(new URL('../../packages-engine/core/src/', import.meta.url))

function normalizeFilePath(filePath: string) {
  return filePath.replaceAll('\\', '/')
}

function isActisCoreSourceFile(filePath: string) {
  const normalizedFilePath = normalizeFilePath(filePath)
  const normalizedCoreSrcDir = normalizeFilePath(ACTIS_CORE_SRC_DIR)

  return normalizedFilePath.startsWith(normalizedCoreSrcDir)
}

async function buildActisCoreBundle() {
  const result = await buildWithEsbuild({
    entryPoints: [ACTIS_CORE_ENTRY_POINT],
    bundle: true,
    write: false,
    format: 'iife',
    globalName: 'Actis',
    platform: 'browser',
    target: 'es2018',
    minify: true,
    legalComments: 'inline',
  })
  const output = result.outputFiles[0]?.text

  if (!output) {
    throw new Error('Failed to bundle Actis core for playground export')
  }

  return output
}

export function actisCoreBundle(): Plugin {
  let bundlePromise: Promise<string> | null = null
  let devServer: ViteDevServer | null = null

  function invalidateBundle() {
    bundlePromise = null

    const bundleModule = devServer?.moduleGraph.getModuleById(RESOLVED_ACTIS_CORE_BUNDLE_MODULE_ID)
    if (bundleModule) {
      devServer?.moduleGraph.invalidateModule(bundleModule)
    }
  }

  return {
    name: 'actis-core-bundle',
    buildStart() {
      invalidateBundle()
      this.addWatchFile(ACTIS_CORE_ENTRY_POINT)
    },
    configureServer(server) {
      devServer = server
      server.watcher.add(ACTIS_CORE_SRC_DIR)
    },
    resolveId(id: string) {
      if (id === ACTIS_CORE_BUNDLE_MODULE_ID) {
        return RESOLVED_ACTIS_CORE_BUNDLE_MODULE_ID
      }

      return null
    },
    async load(id: string) {
      if (id !== RESOLVED_ACTIS_CORE_BUNDLE_MODULE_ID) {
        return null
      }

      bundlePromise ??= buildActisCoreBundle()
      const bundle = await bundlePromise

      return `export default ${JSON.stringify(bundle)}`
    },
    handleHotUpdate(ctx) {
      if (isActisCoreSourceFile(ctx.file)) {
        invalidateBundle()
      }
    },
  }
}
