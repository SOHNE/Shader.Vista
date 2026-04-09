import { useClipboard } from '@vueuse/core'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

export function useSharing() {
  const { copy, copied } = useClipboard()

  function getShareUrl(data: string) {
    const url = new URL(window.location.href)
    const compressed = compressToEncodedURIComponent(data)
    url.searchParams.set('code', compressed)
    return url.toString()
  }

  async function share(data: string) {
    const url = getShareUrl(data)
    window.history.replaceState({}, '', url)
    await copy(url)
  }

  function getDataFromUrl() {
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
    getDataFromUrl,
  }
}
