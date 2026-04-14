import { decompressFromEncodedURIComponent as decode, compressToEncodedURIComponent as encode } from 'lz-string'
import { ref } from 'vue'

const CODE_PARAM = 'code'
const VERSION_PARAM = 'version'
const DEFAULT_VERSION = 'latest'

function getWindowUrl() {
  return new URL(window.location.href)
}

function getParams(value: string) {
  if (!value) {
    return new URLSearchParams()
  }

  return new URLSearchParams(value.startsWith('?') || value.startsWith('#') ? value.slice(1) : value)
}

function getHashParams(url = getWindowUrl()) {
  return getParams(url.hash)
}

function getSearchParams(url = getWindowUrl()) {
  return getParams(url.search)
}

function readSelectedVersion() {
  if (typeof window === 'undefined') {
    return DEFAULT_VERSION
  }

  return getSearchParams().get(VERSION_PARAM) || DEFAULT_VERSION
}

export const selectedVersion = ref(readSelectedVersion())

export function getSelectedVersionFromUrl() {
  return typeof window === 'undefined' ? DEFAULT_VERSION : getSearchParams().get(VERSION_PARAM) || DEFAULT_VERSION
}

export function syncSelectedVersionFromUrl() {
  selectedVersion.value = readSelectedVersion()
  return selectedVersion.value
}

export function setSelectedVersionInUrl(version: string) {
  if (typeof window === 'undefined') {
    return
  }

  selectedVersion.value = version

  const url = getWindowUrl()

  if (version === DEFAULT_VERSION) {
    url.searchParams.delete(VERSION_PARAM)
  }
  else {
    url.searchParams.set(VERSION_PARAM, version)
  }

  window.location.assign(url.toString())
}

export function getSharedCodeFromUrl() {
  if (typeof window === 'undefined') {
    return null
  }

  const compressed = getHashParams().get(CODE_PARAM)
  return compressed ? decode(compressed) : null
}

export function getShareUrl(data: string) {
  const url = getWindowUrl()
  const hashParams = getHashParams(url)

  hashParams.set(CODE_PARAM, encode(data))
  url.hash = hashParams.toString()
  url.searchParams.delete(CODE_PARAM)

  return url.toString()
}

export function syncSharedCodeToUrl(data: string) {
  if (typeof window === 'undefined') {
    return ''
  }

  const url = getShareUrl(data)

  if (url !== window.location.href) {
    window.history.replaceState({}, '', url)
  }

  return url
}
