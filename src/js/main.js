import '../scss/main.scss'
import Main from './components/main.vue'
import Vue from 'vue'
import Shortkey from 'vue-shortkey'
import store from './store'
import Notifications from 'vue-notification'
import Meta from 'vue-meta'
import { ipcRenderer } from 'electron'
import { OPEN_MD_FILE, CREATE_WINDOW } from '@main/const'
import { mapMutations, mapActions, mapState } from 'vuex'
import { dirname, join } from 'path'
import fs from 'fs'
import { md2ary } from '@renderer/util'

Vue.use(Shortkey)
Vue.use(Notifications)
Vue.use(Meta)

const vm = new Vue({
  store,
  render: h => h(Main),
  metaInfo() {
    return {
      title: this.$store.getters['file/title'],
      titleTemplate: `${this.$store.state.file.edited ? '* ' : ''}%s - Reveal editor`
    }
  },
  // errorCaptured(e) {
  //   console.error(e)
  //   this.$notify({
  //     type: 'is-danger',
  //     text: e.message
  //   })
  //   return false
  // }
}).$mount('#app')

ipcRenderer.on(OPEN_MD_FILE, (e, filepath) => store.dispatch('file/openSlide', filepath))
