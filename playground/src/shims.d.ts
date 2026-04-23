declare const __SHA__: string
declare const __LASTEST_TAG__: string
declare const __LASTEST_TAG_SHA__: string

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}
