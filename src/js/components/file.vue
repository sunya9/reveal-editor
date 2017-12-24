<template>
  <div class="is-overlay">
    <transition name="slideLeft">
      <div class="drawer" v-show="showfileMenu">
        <aside class="menu">
          <h3 class="menu-label">{{$store.getters['file/title']}}</h3>
          <ul class="menu-list">
            <li v-for="item in menuItems"
              :key="item.label">
              <a href="#" @click="action(item.action)">
                <div class="level">
                  <div class="level-left">
                    <div class="level-item">
                      {{item.label}}
                    </div>
                  </div>
                  <div class="level-right has-text-grey">
                    <div class="level-item">
                      {{item.shortcut}}
                    </div>
                  </div>
                </div>
              </a>
              <ul v-if="item.children">
                <li v-for="child in item.children" :key="child.label">
                  <a href="#" @click="action(child.action)">
                    <div class="level">
                      <div class="level-left">
                        <div class="level-item">
                          {{child.label}}
                        </div>
                      </div>
                      <div class="level-right has-text-grey">
                        <div class="level-item">
                          {{child.shortcut}}
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
          <iframe ref="pdf"></iframe>
        </aside>
      </div>
    </transition>
    <transition name="fade">
      <div class="background" v-show="showfileMenu" @click="closeFileMenu"></div>
    </transition>
    </div>
</template>
<script>
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
import { remote, ipcRenderer, webContents } from 'electron'
import { join, dirname } from 'path'
import { safeDump } from 'js-yaml'
import { previewTemplate, generateIframe } from '@renderer/util'
import { CREATE_WINDOW } from '@main/const'
import fs from 'fs-extra'
import { PDF } from '@main/const'
import tempfile from 'tempfile'
import { format } from 'url'
import bus, { EVENTS } from '@renderer/bus'
import progress from 'progress-stream'

const { dialog } = remote

export default {
  data() {
    return {
      menuItems: [
        { label: 'New', action: 'newSlide', shortcut: 'Ctrl-N' },
        { label: 'Open', action: 'openSlide', shortcut: 'Ctrl-O' },
        { label: 'Save', action: 'save', shortcut: 'Ctrl-S', children: [
          { label: 'Save as', action: 'saveAs', shortcut: 'Ctrl-Shift-S' },
          { label: 'Export as PDF', action: 'exportAsPDF' },
          { label: 'Export as HTML', action: 'exportAsHTML' },
        ] },
        { label: 'Exit', action: 'exit', shortcut: 'Ctrl-Q' }
      ]
    }
  },
  computed: {
    ...mapState('app', ['showfileMenu']),
    ...mapState('file', ['edited', 'baseDir'])
  },
  methods: {
    ...mapMutations('app', ['closeFileMenu']),
    ...mapActions('file', ['newSlide', 'openSlide', 'save', 'saveAs']),
    async action(name) {
      await this[name]()
      this.closeFileMenu()
    },
    async exportAsPDF() {
      if(!this.save()) return
      const filename = dialog.showSaveDialog({
        filters: [
          { name: 'Portable document format', extensions: ['pdf'] }
        ],
        defaultPath: join(this.baseDir, 'index.pdf')
      })
      if(!filename) return true
      const html = previewTemplate(true, {
        export: 'pdf'
      })
      const temppath = tempfile('.html')
      bus.$emit(EVENTS.PROGRESSBAR_MODAL.OPEN)
      try {
        await fs.writeFile(temppath, html)
        bus.$emit(EVENTS.PROGRESSBAR_MODAL.PROGRESS, 40)
        const win = new remote.BrowserWindow({
          parent: remote.getCurrentWindow(),
          show: false
        })
        win.loadURL(format({
          pathname: temppath,
          protocol: 'file:',
          slashes: true,
          search: 'print-pdf'
        }))
        bus.$emit(EVENTS.PROGRESSBAR_MODAL.PROGRESS, 60)
        await new Promise(resolve => win.webContents.on('did-finish-load', resolve))
        const data = await new Promise((resolve, reject) => {
          win.webContents.printToPDF({ printBackground: true, landscape: true }, async (err, data) => !err ? resolve(data) : reject(err))
        })
        await fs.writeFile(filename, data)
        bus.$emit(EVENTS.PROGRESSBAR_MODAL.PROGRESS, 100)
        await this.$nextTick()
        bus.$emit(EVENTS.PROGRESSBAR_MODAL.CLOSE)
        this.$notify('Exported!')
        win.close()
      } catch(e) {
        console.error(e)
        this.$notify({
          type: 'is-danger',
          text: 'Fail to export as PDF'
        })
      }
      return true
    },
    async exportAsHTML() {
      if(!this.save()) return
      const filename = dialog.showSaveDialog({
        filters: [
          { name: 'Hyper text markup language', extensions: ['html'] }
        ],
        defaultPath: join(this.baseDir, 'index.html')
      })
      if(!filename) return
      const html = previewTemplate(true, {
        assetsPrefix: true,
        export: 'html'
      })
      await fs.writeFile(filename, html)
      this.$notify('Exported!')
      return true
    },
    exit() {
      window.close()
    }
  }
}
</script>

<style scoped lang="scss">
.menu {
  position: absolute;
  width: 10%;
  min-width: 300px;
  padding: 1rem 0;
  bottom: 0;
  top: 0;
  background: #fff;
  z-index: 19;
  box-shadow: 5px 0 10px rgba(#000, .2);
}

.menu-label {
  padding: 0 .5rem;
}

.background {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 10;
  background: rgba(0, 0, 0, .5);
}

.slideLeft-enter-active, .slideLeft-leave-active {
  transition: left .2s;
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
}

.slideLeft-enter, .slideLeft-leave-to {
  left: -100%;
}
.menu ul {
  margin-right: 0;
}
</style>
