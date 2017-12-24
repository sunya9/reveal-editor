<template>
  <iframe ref="iframe" v-show="!hidden"></iframe>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import {
  makeSections,
  previewTemplate,
  revealOptions,
  getThemeURL,
  getSyntaxThemeURL,
  revealEvents
} from '../util'

export default {
  props: {
    revealOptions: {
      type: Object,
      default: () => ({})
    },
    viewNextSlide: {
      type: Boolean,
      default: false
    },
    eventTarget: null
  },
  data() {
    return {
      reveal: null,
      hidden: true
    }
  },
  computed: {
    ...mapState(['app', 'file']),
    ...mapGetters('file', ['selectedSlide', 'assetsMap']),
    htmlSlides() {
      return makeSections()
    }
  },
  mounted() {
    const blob = new Blob([previewTemplate()], { type: 'text/html' })
    this.$refs.iframe.src = `${URL.createObjectURL(blob)}#/${this.app.indices.h}`
    this.$nextTick()
      .then(() => new Promise(resolve => {
        this.$refs.iframe.onload = () => {
          this.reveal = this.$refs.iframe.contentWindow.Reveal
          revealEvents.forEach(event => {
            this.reveal.addEventListener(event, e => {
              const state = this.reveal.getState()
              delete state.overview
              if(!this.eventTarget) return
              this.eventTarget.postMessage(JSON.stringify({ method: 'setState', args: [state]}), '*')
            })
          })
          resolve()
        }
      }))
      .then(this.revealInit)
  },
  watch: {
    'selectedSlide.uuid'() {
      if(!this.reveal) return
      const { h, v } = this.app.indices
      this.$nextTick(() => this.reveal.slide(h + +this.viewNextSlide, v))
    },
    'file.options'(options) {
      if(!this.reveal) return
      this.reveal.configure(options)
    },
    htmlSlides: 'updateDOM',
    'file.theme': 'updateTheme',
    'file.syntaxTheme': 'updateSyntaxTheme'
  },
  methods: {
    ...mapMutations('app', ['setIndices']),
    async revealInit() {

      this.reveal = this.$refs.iframe && this.$refs.iframe.contentWindow.Reveal
      this.reveal.initialize(revealOptions({
        history: false,
        embedded: true,
        postMessageEvents: true,
        ...this.revealOptions
      }))
      this.reveal.addEventListener('slidechanged', e => {
        this.$emit('progress', this.reveal.getProgress())
        if(e.indexh === this.app.indices.h && e.indexv === this.app.indices.v) return
        if(!this.viewNextSlide)
          this.setIndices({ h: e.indexh, v: e.indexv })
      })
      await this.updateDOM()
      await Promise.all([
        this.updateTheme(),
        this.updateSyntaxTheme()
      ])
      this.hidden = false
      this.$emit('progress', this.reveal.getProgress())
    },
    async updateDOM() {
      if(!this.reveal) return
      const frameDoc = this.$refs.iframe.contentWindow.document
      const slidesEl = frameDoc.getElementById('inner-slides')
      slidesEl.innerHTML = this.htmlSlides
      await this.$nextTick()
      this.reveal.sync()
      const { h = 0 } = this.reveal.getIndices()
      this.reveal.slide(h + +this.viewNextSlide)
      const { hljs } = this.$refs.iframe.contentWindow
      if(hljs) {
        hljs.initHighlighting()
        hljs.initHighlighting.called = false // hack
      }
    },
    updateTheme() {
      return this.replaceTheme(getThemeURL(), 'theme')
    },
    updateSyntaxTheme() {
      return this.replaceTheme(getSyntaxThemeURL(), 'syntax-theme')
    },
    replaceTheme(href, clazz) {
      return new Promise(resolve => {
        const frameDoc = this.$refs.iframe.contentWindow.document
        const prevLinks = frameDoc.querySelectorAll(`.${clazz}-link`)
        if(prevLinks) {
          [...prevLinks].forEach(link => {
            link.classList.remove(`${clazz}-link`)
            link.classList.add(`prev-${clazz}-link`)
          })
        }
        const createLink = frameDoc.createElement('link')
        createLink.rel = 'stylesheet'
        createLink.href = href
        createLink.classList.add(`${clazz}-link`)
        frameDoc.head.appendChild(createLink)
        createLink.addEventListener('load', () => {
          const links = frameDoc.querySelectorAll(`.prev-${clazz}-link`)
          if(links)
            [...links].forEach(link => link.parentNode.removeChild(link))
        })
        resolve()
      })
    }
  },
}

</script>
<style scoped>
iframe {
  display: block;
  height: 100%;
  width: 100%;
}
</style>
