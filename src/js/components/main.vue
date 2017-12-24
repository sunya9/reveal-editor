<template>
  <div>
    <div>
      <div class="holygrail"
        v-shortkey="{
          preview: ['f5'],
          previewFromCurrent: ['shift', 'f5'],
          addSlide: ['ctrl', 'm'],
          newSlide: ['ctrl', 'n'],
          openSlide: ['ctrl', 'o'],
          save: ['ctrl', 's'],
          saveAs: ['ctrl', 'shift', 's'],
          exit: ['ctrl', 'q'],
          }"
        v-if="!presenterMode"
        @shortkey="globalKey"
        @dragover.prevent="dragover"
        @drop.stop.prevent="drop"
        @click.ctrl.prevent.stop
        @click.shift.prevent.stop
        >
        <file ref="file" />
        <toolbar />
        <div class="holygrail-contents container is-fluid">
          <div class="tile">
            <left-pane />
            <editor-wrapper />
          </div>
        </div>
      </div>
      <presenter v-else />
    </div>
    <modal />
    <config-modal />
    <notifications>
      <template slot="body" slot-scope="props">
        <div class="notification" :class="props.item.type || 'is-success'">
          <button class="delete"></button>
          <h4 v-if="props.item.title" class="title is-4">
            {{props.item.title}}
          </h4>
          <div v-html="props.item.text" />
        </div>
      </template>
    </notifications>
    <progress-bar />
  </div>
</template>
<script>
import Toolbar from './toolbar.vue'
import EditorWrapper from './editor-wrapper.vue'
import { mapActions, mapMutations, mapGetters } from 'vuex'
import File from './file.vue'
import RemoveModal from './remove-modal.vue'
import Modal from './modal.vue'
import ConfigModal from './config-modal.vue'
import { EVENTS } from '../bus'
import { preview } from '../util'
import LeftPane from './left-pane.vue'
import Presenter from './presenter.vue'
import pluralize from 'pluralize'
import { remote } from 'electron'
import ProgressBar from './progress-bar.vue'

export default {
  EVENTS,
  data() {
    return {
      list: 'slides',
      closeWindow: false
    }
  },
  components: {
    Toolbar,
    EditorWrapper,
    File,
    RemoveModal,
    Modal,
    ConfigModal,
    LeftPane,
    Presenter,
    ProgressBar
  },
  computed: {
    ...mapGetters('app', ['presenterMode'])
  },
  mounted() {
    window.addEventListener('beforeunload', this.unloadConfirm)
  },
  methods: {
    ...mapActions('file', ['addSlide', 'addAssets', 'newSlide', 'openSlide', 'save', 'saveAs']),
    ...mapMutations('app', ['openPreview']),
    globalKey({ srcKey: command }) {
      const fn = this[command] || ({
        preview: () => this.openPreview(),
        previewFromCurrent: () =>  this.openPreview(true),
        save: () => this.$refs.file.save()
      })[command] || (() => null)
      fn()
    },
    // https://github.com/electron/electron/issues/7977#issuecomment-267430262
    unloadConfirm(e) {
      if(this.closeWindow) return
      if(this.$store.state.file.edited) {
        e.returnValue = false
        setTimeout(() => {
          const res = remote.dialog.showMessageBox({
            message: 'You changes will be lost if won\'t save them.',
            buttons: ['OK', 'Cancel']
          })
          if(res === 0) {
            this.closeWindow = true
            remote.getCurrentWindow().close()
          }
        }, 0)
      }
    },
    exit() {
      remote.getCurrentWindow().close()
    },
    dragover(e) {
      e.dataTransfer.dropEffect = 'copy'
    },
    async drop(e) {
      if(e.dataTransfer.files.length && /\.(reveal\.json|md)$/.test(e.dataTransfer.files[0].name)) {
        // reveal editor project
        this.openSlide(e.dataTransfer.files[0].path)
      } else {
        const images = Array.from(e.dataTransfer.files)
          .filter(file => file.type.startsWith('image'))
        if(!images.length) return
        const success = await this.addAssets(images)
        if(success) {
          this.$notify(`Copy ${pluralize('image', success, true)}.`)
        }
        const duplicate = images.length - success
        if(duplicate) {
          this.$notify({
            type: 'is-warning',
            text: `Skip ${pluralize('image', duplicate, true)}(already exists).`
          })
        }
      }
    }
  }
}
</script>


<style scoped>
.delete {
  margin: .5rem;
}
</style>
