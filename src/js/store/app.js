import { previewTemplate, generateIframe } from '@renderer/util'
import store from './'

const defaultState = () => {
  return {
    indices: {
      h: -1,
      v: 0
    },
    cursor: {},
    showfileMenu: false,
    isMac: /Mac/.test(navigator.platform),
    previewWindow: null
  }
}

export default {
  namespaced: true,
  state: { ...defaultState() },
  getters: {
    presenterMode({ previewWindow }) {
      return !!previewWindow
    },
    frame({ previewWindow }) {
      return previewWindow && previewWindow.frames[0]
    }
  },
  mutations: {
    toggleFileMenu(state) {
      state.showfileMenu = !state.showfileMenu
    },
    closeFileMenu(state) {
      state.showfileMenu = false
    },
    showFileMenu(state) {
      state.showfileMenu = true
    },
    updateCursor(state, cursor) {
      state.cursor = cursor
    },
    setIndices(state, indices) {
      if(indices.h < 0 || indices.h >= store.state.file.slides.length) return
      state.indices = { ...state.indices, ...indices }
    },
    initAppState(state) {
      Object.assign(state, defaultState())
    },
    openPreview(state, current = false) {
      const html = previewTemplate(true, {
        assetsMap: store.getters['file/assetsMap']
      })
      const blob = new Blob([html], { type: 'text/html' })
      if(!current) {
        this.commit('app/setIndices', { h: 0, v: 0 })
      }
      const fileURL = `${URL.createObjectURL(blob)}#/${current ? state.indices.h : 0}`
      const { baseDir } = store.state.file
      const win = window.open('', '_new', 'fullscreen=yes')
      win.document.write(generateIframe(fileURL))
      const frame = win.frames[0]
      frame.focus()
      win.document.body.style.margin = 0
      win.addEventListener('unload', () => {
        this.commit('app/closePreview')
      })
      // If the preview is shown on external display, show notes
      const showNotes = win.screenX !== window.screenX
        || win.screenY !== window.screenY
      state.previewWindow = win
    },
    closePreview(state) {
      if(state.previewWindow && !state.previewWindow.closed) {
        state.previewWindow.close()
      }
      state.previewWindow = null
    }
  },
}
