import Vue from 'vue'

export const EVENTS = {
  EDITOR: {
    SEND_ACTION: 'editor.sendAction'
  },
  CONFIG_MODAL: {
    OPEN: 'configModal.open'
  },
  MODAL: {
    OPEN: 'modal.open'
  },
  PROGRESSBAR_MODAL: {
    OPEN: 'progressbar.open',
    CLOSE: 'progressbar.close',
    PROGRESS: 'progressbar.progress'
  }
}

export default new Vue
