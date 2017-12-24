import Vuex from 'vuex'
import Vue from 'vue'
import file from './file'
import app from './app'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    file, app
  },
  mutations: {
    initStates() {
      this.commit('app/initAppState')
      this.commit('file/initFileState')
    }
  }
})

export default store
