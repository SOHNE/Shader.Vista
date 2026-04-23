import type { ComponentPublicInstance, InjectionKey, Ref } from 'vue'
import { useElementSize, useLocalStorage } from '@vueuse/core'
import { computed, inject, provide, ref, watch } from 'vue'

type PanelGroupContext = {
  panelSizes: Ref<number[]>
  titleHeightPercent: Readonly<Ref<number>>
  isCollapsed: (idx: number) => boolean
  togglePanel: (idx: number) => void
  updatePanelSizes: (value: number[]) => void
}

type UsePanelGroupOptions = {
  panelCount: number
  storageKey: string
  initialSizes?: number[]
  titleHeightPx?: number
}

const COLLAPSE_SNAP_TOLERANCE_PX = 4

const panelGroupKey: InjectionKey<PanelGroupContext> = Symbol('actis-panel-group')

export function providePanelGroup(
  panelEl: Ref<HTMLElement | ComponentPublicInstance | null | undefined>,
  {
    panelCount,
    storageKey,
    initialSizes,
    titleHeightPx = 34,
  }: UsePanelGroupOptions,
) {
  const TITLE_HEIGHT = titleHeightPx
  const collapsedPanels = ref(new Set<number>())
  const { height: vh } = useElementSize(panelEl)

  const titleHeightPercent = computed(() => {
    if (!vh.value) {
      return 0
    }

    return TITLE_HEIGHT / vh.value * 100
  })

  const collapseThresholdPercent = computed(() => {
    if (!vh.value) {
      return titleHeightPercent.value
    }

    return (TITLE_HEIGHT + COLLAPSE_SNAP_TOLERANCE_PX) / vh.value * 100
  })

  function getInitialPanelSizes(percent: number): number[] {
    if (initialSizes?.length === panelCount) {
      return [...initialSizes]
    }

    if (panelCount <= 0) {
      return []
    }

    if (panelCount === 1) {
      return [100]
    }

    return [
      100 - percent * (panelCount - 1),
      ...Array.from<number>({ length: panelCount - 1 }).fill(percent),
    ]
  }

  const panelSizes = useLocalStorage<number[]>(
    storageKey,
    getInitialPanelSizes(titleHeightPercent.value),
    { listenToStorageChanges: false },
  )

  function isCollapsed(idx: number) {
    return collapsedPanels.value.has(idx)
  }

  function normalizePanels() {
    const expandedHeight = (100 - collapsedPanels.value.size * titleHeightPercent.value) / (panelSizes.value.length - collapsedPanels.value.size)
    panelSizes.value = panelSizes.value.map((_, idx) => collapsedPanels.value.has(idx) ? titleHeightPercent.value : expandedHeight)
  }

  function togglePanel(idx: number) {
    if (collapsedPanels.value.has(idx)) {
      collapsedPanels.value.delete(idx)
    }
    else {
      collapsedPanels.value.add(idx)
      if (collapsedPanels.value.size === panelSizes.value.length)
        collapsedPanels.value.delete((idx + 1) % panelSizes.value.length)
    }

    normalizePanels()
  }

  function updatePanelSizes(value: number[]) {
    let hasNewCollapsedPanel = false

    value.forEach((height, idx) => {
      const shouldCollapse = height <= collapseThresholdPercent.value
      const wasCollapsed = collapsedPanels.value.has(idx)

      if (shouldCollapse) {
        collapsedPanels.value.add(idx)
        hasNewCollapsedPanel ||= !wasCollapsed
      }
      else {
        collapsedPanels.value.delete(idx)
      }
    })

    panelSizes.value = value

    if (hasNewCollapsedPanel) {
      normalizePanels()
    }
  }

  watch(
    panelSizes,
    (value) => {
      value.forEach((height, idx) => {
        if (height > collapseThresholdPercent.value)
          collapsedPanels.value.delete(idx)
        else
          collapsedPanels.value.add(idx)
      })
    },
  )

  watch(titleHeightPercent, (value) => {
    const spareSpace = (100 - collapsedPanels.value.size * value - panelSizes.value.reduce((uncollapsed, height, idx) => collapsedPanels.value.has(idx) ? uncollapsed : uncollapsed + height, 0)) / (panelSizes.value.length - collapsedPanels.value.size)
    panelSizes.value = panelSizes.value.map((height, idx) => (height <= value || collapsedPanels.value.has(idx)) ? value : height + spareSpace)
  })

  const context: PanelGroupContext = {
    panelSizes,
    titleHeightPercent,
    isCollapsed,
    togglePanel,
    updatePanelSizes,
  }

  provide(panelGroupKey, context)

  return context
}

export function usePanelGroup() {
  const context = inject(panelGroupKey)

  if (!context) {
    throw new Error('CollapsiblePanel must be used inside PanelGroup.')
  }

  return context
}
