import { onMounted, ref } from 'vue'
import pkg from '../../package.json'

export function useVersions() {
  const versions = ref<string[]>([])
  const npmLatestVersion = ref('')
  const workspaceVersion = ref(pkg.version)
  const gitSha = ref(__SHA__)
  const gitTag = ref(__LASTEST_TAG__)
  const gitTagSha = ref(__LASTEST_TAG_SHA__)
  const urlParams = new URLSearchParams(window.location.search)
  const selectedVersion = ref(urlParams.get('version') || 'latest')

  async function getVersionsList() {
    const res = await fetch('https://data.jsdelivr.com/v1/package/npm/@actis/core')
    const data = await res.json()
    const list = (data.versions as string[]).filter(v => !v.includes('-')).slice(0, 25)

    if (list.length > 0)
      npmLatestVersion.value = list[0]

    return list
  }

  onMounted(async () => {
    const list = await getVersionsList()
    // Only filter out the version from the NPM list if it's identical to the workspace version
    versions.value = ['latest', ...list.filter(v => v !== workspaceVersion.value)]
  })

  function setVersion(version: string) {
    if (version === 'latest') {
      urlParams.delete('version')
    }
    else {
      urlParams.set('version', version)
    }
    window.location.search = urlParams.toString()
  }

  function getReleaseLink(version: string) {
    if (version === 'latest')
      return `https://github.com/SOHNE/Actis/commit/${gitSha.value}`
    return `https://github.com/SOHNE/Actis/releases/tag/v${version}`
  }

  return {
    versions,
    npmLatestVersion,
    workspaceVersion,
    gitSha,
    gitTag,
    gitTagSha,
    selectedVersion,
    setVersion,
    getReleaseLink,
  }
}
