import { useClipboard } from '@vueuse/core'
import { getSharedCodeFromUrl, syncSharedCodeToUrl } from './url'

export function useSharing() {
  const { copy, copied } = useClipboard()

  function syncDataToUrl(data: string) {
    return syncSharedCodeToUrl(data)
  }

  async function share(data: string) {
    const url = syncDataToUrl(data)
    await copy(url)
  }

  function getDataFromUrl() {
    return getSharedCodeFromUrl()
  }

  return {
    share,
    copied,
    getDataFromUrl,
    syncDataToUrl,
  }
}
