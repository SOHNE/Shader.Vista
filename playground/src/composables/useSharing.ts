import { useClipboard } from '@vueuse/core'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

export function useSharing(code: { value: string }) {
  const { copy, copied } = useClipboard()

  function getShareUrl() {
    const url = new URL(window.location.href)
    const compressed = compressToEncodedURIComponent(code.value)
    url.searchParams.set('code', compressed)
    return url.toString()
  }

  async function share() {
    const url = getShareUrl()
    window.history.replaceState({}, '', url)
    await copy(url)
  }

  function getCodeFromUrl() {
    const params = new URLSearchParams(window.location.search)
    const compressed = params.get('code')
    if (compressed) {
      return decompressFromEncodedURIComponent(compressed)
    }
    return null
  }

  return {
    share,
    copied,
    getCodeFromUrl,
  }
}
