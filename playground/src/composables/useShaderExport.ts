import type { PassConfig } from '@actis/core'
import { computed, readonly, ref } from 'vue'
import pkg from '../../package.json'
import {
  createHtmlCoreExport,
  createHtmlEsmExport,
  getHtmlCoreExportFileName,
  getHtmlEsmExportFileName,
  HTML_CORE_EXPORT_MIME_TYPE,
} from '../export/shaderExportHtml'
import { selectedVersion } from './url'

type ReadPasses = () => PassConfig[]

const workspaceCoreVersion = pkg.version

async function loadActisCoreBundle() {
  const mod = await import('virtual:actis-core-bundle')
  return mod.default
}

function downloadFile(fileName: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  })
}

function getSelectedPreviewVersion() {
  return selectedVersion.value === 'latest' ? 'workspace' : `v${selectedVersion.value}`
}

function getEsmCoreVersion() {
  return selectedVersion.value === 'latest' ? workspaceCoreVersion : selectedVersion.value
}

function getEsmCoreImportUrl(coreVersion: string) {
  return `https://esm.sh/@actis/core@${coreVersion}`
}

export function useShaderExport(readPasses: ReadPasses) {
  const isExporting = ref(false)
  const esmCoreVersion = computed(getEsmCoreVersion)
  const workspaceCoreLabel = computed(() => `@actis/core v${workspaceCoreVersion}`)
  const esmCoreLabel = computed(() => `@actis/core v${esmCoreVersion.value}`)
  const selectedPreviewVersion = computed(getSelectedPreviewVersion)
  const hasPreviewVersionMismatch = computed(() => selectedVersion.value !== 'latest')
  const exportTitle = computed(() => 'Export Shader')

  async function exportHtmlCore() {
    if (isExporting.value) {
      return false
    }

    isExporting.value = true

    try {
      const actisCoreBundle = await loadActisCoreBundle()
      const html = createHtmlCoreExport({
        actisCoreBundle,
        passes: readPasses(),
        selectedPreviewVersion: selectedPreviewVersion.value,
        workspaceCoreVersion,
      })

      downloadFile(getHtmlCoreExportFileName(workspaceCoreVersion), html, HTML_CORE_EXPORT_MIME_TYPE)
      return true
    }
    catch (error) {
      console.error('Failed to export shader:', error)
      return false
    }
    finally {
      isExporting.value = false
    }
  }

  async function exportHtmlEsm() {
    if (isExporting.value) {
      return false
    }

    isExporting.value = true

    try {
      const html = createHtmlEsmExport({
        coreImportUrl: getEsmCoreImportUrl(esmCoreVersion.value),
        coreVersion: esmCoreVersion.value,
        passes: readPasses(),
        selectedPreviewVersion: selectedPreviewVersion.value,
      })

      downloadFile(getHtmlEsmExportFileName(esmCoreVersion.value), html, HTML_CORE_EXPORT_MIME_TYPE)
      return true
    }
    catch (error) {
      console.error('Failed to export shader:', error)
      return false
    }
    finally {
      isExporting.value = false
    }
  }

  return {
    esmCoreLabel,
    exportHtmlCore,
    exportHtmlEsm,
    exportTitle,
    hasPreviewVersionMismatch,
    isExporting: readonly(isExporting),
    workspaceCoreLabel,
  }
}
