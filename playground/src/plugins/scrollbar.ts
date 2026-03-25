import type { Diagnostic } from '@codemirror/lint'
import type { ViewUpdate } from '@codemirror/view'
import { forEachDiagnostic } from '@codemirror/lint'
import { EditorView, ViewPlugin } from '@codemirror/view'

export const scrollbarRuler = ViewPlugin.fromClass(class {
  private gutter: HTMLElement
  private inner: HTMLElement
  private svg: SVGSVGElement
  private thumb: HTMLElement

  private rectPool: SVGRectElement[] = []
  private cursorRect: SVGRectElement

  // Cached layout metrics to prevent synchronous layouts (layout thrashing)
  private trackHeight = 0
  private scrollHeight = 0
  private clientHeight = 0
  private thumbHeight = 0

  private readonly TRACK_WIDTH = 15

  constructor(private readonly view: EditorView) {
    this.gutter = document.createElement('div')
    this.gutter.className = 'cm-scrollbar-gutter'

    this.inner = document.createElement('div')
    this.inner.className = 'cm-scrollbar-inner'

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.svg.setAttribute('aria-hidden', 'true')
    this.svg.style.display = 'block'
    this.svg.style.width = '100%'

    this.thumb = document.createElement('div')
    this.thumb.className = 'cm-scrollbar-thumb'
    this.thumb.style.willChange = 'transform'

    this.inner.appendChild(this.svg)
    this.inner.appendChild(this.thumb)
    this.gutter.appendChild(this.inner)

    view.dom.classList.add('cm-with-scrollbar')
    view.dom.appendChild(this.gutter)

    this.cursorRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    this.cursorRect.setAttribute('x', '0')
    this.cursorRect.setAttribute('y', '0')
    this.cursorRect.setAttribute('width', `${this.TRACK_WIDTH}`)
    this.cursorRect.setAttribute('height', '2')
    this.cursorRect.setAttribute('fill', 'var(--cm-foreground, #888)')
    this.cursorRect.style.willChange = 'transform'
    this.svg.appendChild(this.cursorRect)

    this.thumb.addEventListener('pointerdown', this.onThumbPointerDown)
    this.inner.addEventListener('pointerdown', this.onTrackPointerDown)

    // Passive listener allows the browser compositor to run smoothly,
    // while our synchronous updates eliminate the 1-frame latency.
    this.view.scrollDOM.addEventListener('scroll', this.syncThumb, { passive: true })

    this.measureAndPaint()
  }

  private onThumbPointerDown = (e: PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    this.thumb.setPointerCapture(e.pointerId)

    const startY = e.clientY
    const startScrollTop = this.view.scrollDOM.scrollTop

    const onMove = (ev: PointerEvent) => {
      // Synchronous write completely removes drag lag.
      const maxThumbTop = this.trackHeight - this.thumbHeight
      const maxScrollTop = this.scrollHeight - this.clientHeight
      if (maxThumbTop <= 0)
        return

      this.view.scrollDOM.scrollTop = startScrollTop + (ev.clientY - startY) * (maxScrollTop / maxThumbTop)
    }

    const onUp = () => {
      this.thumb.removeEventListener('pointermove', onMove)
      this.thumb.removeEventListener('pointerup', onUp)
    }

    this.thumb.addEventListener('pointermove', onMove)
    this.thumb.addEventListener('pointerup', onUp)
  }

  private onTrackPointerDown = (e: PointerEvent) => {
    if (e.target === this.thumb)
      return
    e.preventDefault()

    const rect = this.inner.getBoundingClientRect()
    const clickFraction = Math.max(0, Math.min(1, (e.clientY - rect.top - this.thumbHeight / 2) / (this.trackHeight - this.thumbHeight)))
    this.view.scrollDOM.scrollTop = clickFraction * (this.scrollHeight - this.clientHeight)
  }

  // Pure DOM Write function tied directly to the scroll event.
  // Because we do not query layout dimensions here, it is instant.
  private syncThumb = () => {
    const maxScroll = this.scrollHeight - this.clientHeight
    if (maxScroll <= 0) {
      this.thumb.style.display = 'none'
      return
    }

    this.thumb.style.display = ''

    const scrollTop = this.view.scrollDOM.scrollTop
    const thumbTop = (scrollTop / maxScroll) * (this.trackHeight - this.thumbHeight)

    this.thumb.style.transform = `translate3d(0, ${thumbTop}px, 0)`
  }

  update(update: ViewUpdate) {
    let needsFullPaint = false

    if (update.geometryChanged) {
      this.measure()
      needsFullPaint = true
    }

    if (update.docChanged || update.transactions.some(t => t.effects.length > 0)) {
      needsFullPaint = true
    }

    if (needsFullPaint) {
      this.paintMarkers()
    }

    if (update.selectionSet || needsFullPaint) {
      this.paintCursor()
    }
  }

  private measure() {
    const scrollDOM = this.view.scrollDOM
    this.scrollHeight = scrollDOM.scrollHeight
    this.clientHeight = scrollDOM.clientHeight

    const scrollerRect = scrollDOM.getBoundingClientRect()
    const editorRect = this.view.dom.getBoundingClientRect()

    this.trackHeight = scrollerRect.height

    this.gutter.style.top = `${scrollerRect.top - editorRect.top}px`
    this.gutter.style.height = `${this.trackHeight}px`
    this.svg.setAttribute('height', `${this.trackHeight}`)

    const newThumbHeight = Math.max(20, (this.clientHeight / this.scrollHeight) * this.trackHeight)
    if (Math.abs(this.thumbHeight - newThumbHeight) > 0.5) {
      this.thumbHeight = newThumbHeight
      this.thumb.style.height = `${newThumbHeight}px`
    }
  }

  private measureAndPaint() {
    this.measure()
    this.paintMarkers()
    this.paintCursor()
    this.syncThumb()
  }

  private paintCursor() {
    const { state } = this.view
    if (state.doc.length === 0 || this.scrollHeight <= 0)
      return

    const y = this.posToY(state.selection.main.head)
    this.cursorRect.style.transform = `translate3d(0, ${y}px, 0)`
  }

  private paintMarkers() {
    const { state } = this.view
    if (state.doc.length === 0 || this.trackHeight <= 0 || this.scrollHeight <= 0)
      return

    let i = 0
    forEachDiagnostic(state, (diag: Diagnostic) => {
      if (diag.severity !== 'error')
        return

      const top = this.posToY(diag.from)
      const bottom = this.posToY(diag.to)
      const height = Math.max(3, bottom - top)

      let rect: SVGRectElement
      if (i < this.rectPool.length) {
        rect = this.rectPool[i]!
      }
      else {
        rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', '0')
        rect.setAttribute('y', '0')
        rect.setAttribute('width', `${this.TRACK_WIDTH}`)
        rect.setAttribute('height', '1') // Base height 1, scaled via GPU transform
        rect.setAttribute('fill', '#ff5555')
        rect.style.transformOrigin = '0 0'
        this.svg.insertBefore(rect, this.cursorRect)
        this.rectPool.push(rect)
      }

      rect.style.transform = `translate3d(0, ${top}px, 0) scaleY(${height})`
      rect.style.display = ''
      i++
    })

    // Turn off unused elements in the pool
    while (i < this.rectPool.length) {
      this.rectPool[i]!.style.display = 'none'
      i++
    }
  }

  private posToY(pos: number): number {
    if (this.scrollHeight <= 0)
      return 0
    const safePos = Math.max(0, Math.min(pos, this.view.state.doc.length))
    const block = this.view.lineBlockAt(safePos)
    const yOffset = block.top + this.view.documentPadding.top
    return (yOffset / this.scrollHeight) * this.trackHeight
  }

  destroy() {
    this.thumb.removeEventListener('pointerdown', this.onThumbPointerDown)
    this.inner.removeEventListener('pointerdown', this.onTrackPointerDown)
    this.view.scrollDOM.removeEventListener('scroll', this.syncThumb)
    this.gutter.remove()
  }
})

export const scrollbarRulerTheme = EditorView.baseTheme({
  '.cm-scrollbar-gutter': {
    position: 'absolute',
    right: '0',
    width: '0.938rem',
    pointerEvents: 'auto',
    overflow: 'hidden',
    zIndex: 10,
    userSelect: 'none',
  },
  '.cm-scrollbar-inner': {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
  },
  '.cm-scrollbar-inner svg': {
    position: 'absolute',
    top: '0',
    left: '0',
    height: '100%',
    pointerEvents: 'none',
  },
  '.cm-scrollbar-thumb': {
    position: 'absolute',
    left: '0',
    right: '0',
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    pointerEvents: 'auto',
    cursor: 'default',
    zIndex: 11,
  },
  '.cm-scrollbar-thumb:hover': {
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
  },
  '.cm-scrollbar-thumb:active': {
    backgroundColor: 'rgba(128, 128, 128, 0.6)',
  },
  '.cm-scroller': {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  '.cm-scroller::-webkit-scrollbar': {
    display: 'none',
  },
})
