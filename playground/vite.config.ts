import Vue from '@vitejs/plugin-vue'
import SimpleGit from 'simple-git'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import { aliasEngine } from '../alias'
import { actisCoreBundle } from './plugins/actisCoreBundle'

const git = SimpleGit()

async function getGitInfo() {
  const sha = await git.revparse(['HEAD']).catch(() => 'unknown')
  const tag = await git.raw(['describe', '--tags', '--abbrev=0'])
    .then(r => r.trim())
    .catch(() => 'unknown')

  const tagSha = tag !== 'unknown'
    ? await git.revparse([tag]).catch(() => 'unknown')
    : 'unknown'

  return { sha, tag, tagSha }
}

const { sha, tag, tagSha } = await getGitInfo()

export default defineConfig({
  base: '/play/',
  define: {
    __SHA__: JSON.stringify(sha),
    __LASTEST_TAG__: JSON.stringify(tag),
    __LASTEST_TAG_SHA__: JSON.stringify(tagSha),
  },
  resolve: {
    alias: aliasEngine,
  },
  plugins: [
    actisCoreBundle(),
    Vue(),
    UnoCSS(),
    Inspect(),
    Components({
      dirs: [
        'src/components',
      ],
      dts: 'src/components.d.ts',
    }),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
      ],
      dirs: [
        'src/composables',
      ],
      vueTemplate: true,
      dts: 'src/auto-imports.d.ts',
    }),
  ],
  server: {
    fs: {
      allow: ['..'],
    },
  },
  build: {
    outDir: '../docs/dist/play',
    emptyOutDir: true,
  },
})
