import { useClipboard } from '@vueuse/core'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

export function useSharing() {
  const { copy, copied } = useClipboard()
  const CODE_PARAM = 'code'

  function getHashParams(url: URL) {
    return new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash)
  }

  function getShareUrl(data: string) {
    const url = new URL(window.location.href)
    const hashParams = getHashParams(url)
    const compressed = compressToEncodedURIComponent(data)

    hashParams.set(CODE_PARAM, compressed)
    url.hash = hashParams.toString()
    url.searchParams.delete(CODE_PARAM)

    return url.toString()
  }

  async function share(data: string) {
    const url = getShareUrl(data)
    window.history.replaceState({}, '', url)
    await copy(url)
  }

  function getDataFromUrl() {
    const url = new URL(window.location.href)
    const hashParams = getHashParams(url)
    const compressed = hashParams.get(CODE_PARAM)

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
