import Vue from 'vue'
import uuid from 'uuid/v4'
import { MD_SEPARATOR, getPlainTitleFromBody, md2ary } from '../util'
import { join, basename, dirname } from 'path'
import fs from 'fs-extra'
import {
  difference
} from 'lodash'
import mime from 'mime-types'
import { CREATE_WINDOW } from '@main/const'
import { remote, ipcRenderer } from 'electron'

const { dialog } = remote

const defaultState = () => {
  return {
    slides: [],
    theme: 'white',
    options: {
    },
    assets: [], // [ { name: String, type: String, blob }]
    syntaxTheme: 'default',
    assetsPath: './assets/',
    edited: false,
    baseDir: '',
    configFile: '.reveal.json'
  }
}

export default {
  namespaced: true,
  state: { ...defaultState() },
  getters: {
    slidesAsMarkdown({ slides }) {
      return slides.map(slide => `${slide.body}

Note:
${slide.note}`).join(MD_SEPARATOR)
    },

    title({ slides: [slide] }) {
      return slide && getPlainTitleFromBody(slide.body) || 'No title'
    },

    exportSettings({ theme, syntaxTheme, options }) {
      return {
        theme, syntaxTheme, options
      }
    },
    getAssetPath({ assetsPath }) {
      return join.bind(null, assetsPath)
    },
    assetsMap({ assets }, getters) {
      return (prefix) =>
        assets.reduce((obj, asset) => {
          obj[prefix ? getters.getAssetPath(asset.name) : asset.name] = asset.url
          return obj
        }, {})
    },
    selectedSlide({ slides }, getters, { app: { indices } }) {
      return indices.v
        ? slides[indices.h].child[v]
        : slides[indices.h] || {}
    },
  },
  mutations: {
    addSlide(state, payload = {}) {
      state.slides.splice(payload.pos, 0, {
        body: '',
        note: '',
        uuid: uuid(),
        ...payload.slide
      })
      this.commit('file/updateEdited')
    },
    updateEdited(state, bool = true) {
      state.edited = bool
    },
    updateSlide(state, payload) {
      const data = { ...state.slides[payload.pos], ...payload.slide }
      Vue.set(state.slides, payload.pos, data)
      this.commit('file/updateEdited')
    },
    removeSlide(state, pos) {
      state.slides.splice(pos, 1)
      this.commit('file/updateEdited')
    },
    updateOptions(state, options) {
      state.options = { ...state.options, ...options }
      this.commit('file/updateEdited')
    },
    updateSyntaxTheme(state, theme) {
      state.syntaxTheme = theme
      this.commit('file/updateEdited')
    },
    updateSlides(state, slides) {
      state.slides = slides.map(slide => !slide.uuid
        ? {
          ...slide,
          uuid: uuid()
        }
        : slide)
      this.commit('file/updateEdited')
    },
    updateTheme(state, theme) {
      state.theme = theme
      this.commit('file/updateEdited')
    },
    addAssets(state, assets) {
      state.assets.push(...assets)
    },
    updateAssets(state, assets) {
      state.assets = assets
    },
    removeAsset(state, index) {
      URL.revokeObjectURL(state.assets[index].url)
      state.assets.splice(index, 1)
    },
    updateBaseDir(state, dirpath) {
      state.baseDir = dirpath
    },
    initFileState(state, override) {
      Object.assign(state, defaultState(), override)
      this.commit('file/updateEdited', false)
    }
  },
  actions: {
    addSlide({ commit, rootState: { app } }, payload = {}) {
      const pos = app.indices.h + 1
      payload.pos = pos
      commit('addSlide', payload)
      commit('app/setIndices', {
        h: pos >= 0 ? pos : 0
      }, { root: true })
    },
    updateSlide({ commit, rootState: { app }, state }, payload) {
      const index = app.indices.h
      payload.pos = index
      commit('updateSlide', payload)
    },
    removeSlide({ commit, rootState: { app }, state }, pos) {
      const only = state.slides.length === 1
      if(app.indices.h > pos || only) {
        commit('app/setIndices', {
          h: only ? -1 : app.indices.h - 1
        }, { root: true })
      }
      commit('removeSlide', pos)
    },
    async addAssets({ commit, state }, newFiles) {
      const addFiles = []
      const alreadyAssets = state.assets.map(asset => asset.name)
      const assets = newFiles
        .filter(file => !alreadyAssets.includes(file.name))
        .map(file => {
          // File to pure object
          return {
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file)
          }
        })
      commit('addAssets', assets)
      commit('updateEdited')
      return assets.length
    },
    async loadAssets({ commit, state }) {
      const { baseDir, assetsPath = 'assets' } = state
      if(!baseDir) return
      const assetsDir = join(baseDir, assetsPath)
      const files = await fs.readdir(assetsDir).catch(() => [])
      const ps = files.map(async name => {
        const filepath = join(assetsDir, name)
        const buffer = await fs.readFile(filepath)
        const type = mime.lookup(filepath)
        const blob = new Blob([buffer], { type })
        const url = URL.createObjectURL(blob)
        return {
          name,
          type,
          url
        }
      })
      const assets = await Promise.all(ps)
      commit('updateAssets', assets)
    },
    async removeAsset({ commit, state }, index) {
      const { assets, baseDir, assetsPath } = state
      const asset = assets[index]
      try {
        // TODO: use fs.stat?
        const assetPath = join(baseDir, assetsPath, asset.name)
        await fs.unlink(assetPath)
      } catch(e) {
        console.warn(e)
      }
      commit('removeAsset', index)
      commit('updateEdited')
    },
    async saveFiles({ state, getters, commit }) {
      const { baseDir, assetsPath, assets } = state
      const { slidesAsMarkdown, exportSettings } = getters
      await fs.writeFile(join(baseDir, 'index.md'), slidesAsMarkdown)
      const config = JSON.stringify(exportSettings)
      await fs.writeFile(join(baseDir, '.reveal.json'), config)
      const fullAssetsPath = join(baseDir, assetsPath)
      await fs.ensureDir(fullAssetsPath)
      const files = await fs.readdir(fullAssetsPath)
      const ps = difference(assets, files)
        .map(async newAsset => {
          const { name, url } = newAsset
          const assetPath = join(fullAssetsPath, name)
          return await fetch(url)
            .then(res => res.arrayBuffer())
            .then(buf => fs.writeFile(assetPath, new Buffer(buf)))
        })
      await Promise.all(ps)
      commit('updateEdited', false)
      return true
    },
    async openFile({ commit, dispatch }, filepath) {
      const baseDir = dirname(filepath)
      const mdPath = join(baseDir, filepath.endsWith('.md')
        ? basename(filepath) : 'index.md')
      const data = await fs.readFile(mdPath, 'utf-8')
      const jsonPath = join(baseDir, '.reveal.json')
      const rawjson = await fs.readFile(jsonPath, 'utf-8').catch(() => null)
      const json = JSON.parse(rawjson)
      const pref = {
        ...json,
        baseDir
      }
      const slides = md2ary(data)

      commit('app/initAppState', null, { root: true })
      commit('initFileState', pref)
      commit('updateSlides', slides)
      await Vue.nextTick()
      commit('app/setIndices', { h: 0 }, { root: true })
      commit('updateEdited', false)
      dispatch('loadAssets')
    },
    async save( { state: { baseDir }, dispatch }) {
      return await dispatch(!baseDir ? 'saveAs': 'saveFiles')
    },
    async saveAs({ commit, dispatch }) {
      const path = dialog.showSaveDialog({
        defaultPath: '.reveal.json',
        filters: [
          { name: 'Reveal editor config file', extensions: ['reveal.json'] },
        ]
      })
      if(!path) return
      const baseDir = dirname(path)
      commit('updateBaseDir', baseDir)
      return await dispatch('save')
    },
    async openSlide({ state, commit, dispatch }, path) {
      if(!path) {
        const paths = dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [
            { name: 'Reveal editor config file', extensions: ['reveal.json'] },
            { name: 'Markdown file', extensions: ['md'] }
          ]
        })
        if(!paths) return
        [path] = paths
      }
      if(state.edited) {
        ipcRenderer.send(CREATE_WINDOW, path)
      } else {
        dispatch('openFile', path)
      }
      return true
    },
    newSlide({ state, commit }) {
      if(state.edited) {
        ipcRenderer.send(CREATE_WINDOW)
      } else {
        commit('initStates', null, { root: true })
      }
    }
  }
}
