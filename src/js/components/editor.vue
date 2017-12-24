<template>
  <div class="editor-root">
    <div class="field editor-slide">
      <div class="control">
        <textarea id="editor" class="textarea" placeholder="# Markdown..."></textarea>
      </div>
    </div>
    <div class="field">
      <div class="control">
        <textarea class="textarea has-fixed-size" placeholder="note..." v-model="note"></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import SimpleMDE from 'simplemde'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import bus, { EVENTS } from '../bus'

export default {
  data() {
    return {
      simplemde: null
    }
  },
  mounted() {
    this.simplemde = new SimpleMDE({
      autoDownloadFontAwesome: false,
      element: this.$el.querySelector('#editor'),
      indentWithTabs: false,
      initialValue: this.selectedSlide.body,
      spellChecker: false,
      toolbar: false,
      status: false,
      shortcuts: {
        togglePreview: null,
        toggleSideBySide: null,
        toggleFullScreen: null
      },
      renderingConfig: {
        codeSyntaxHighlighting: true
      }
    })
    // console.log(this.simplemde.codemirror.getTextArea())
    this.simplemde.codemirror.on('change', () => {
      const newBody = this.simplemde.value()
      if(this.body !== newBody) {
        this.body = newBody
      }
    })
    this.simplemde.codemirror.on('cursorActivity', () => {
      const state = this.simplemde.getState()
      this.updateCursor(state)
    })
    bus.$on(EVENTS.EDITOR.SEND_ACTION, this.action)
  },
  watch: {
    async 'selectedSlide.uuid'() {
      this.simplemde.value(this.selectedSlide.body)
      // this.focus()
    }
  },
  computed: {
    ...mapGetters('file', ['selectedSlide']),
    body: {
      get() {
        return this.selectedSlide.body
      },
      set(body) {
        this.updateSlide({ slide: { body } })
      }
    },
    note: {
      get() {
        return this.selectedSlide.note
      },
      set(note) {
        this.updateSlide({ slide: { note } })
      }
    }
  },
  methods: {
    ...mapMutations('app', ['updateCursor']),
    ...mapActions('file', ['updateSlide']),
    focus() {
      const cm = this.simplemde.codemirror
      cm.focus()
      this.$nextTick(() => cm.setCursor(cm.lineCount(), 0))
    },
    action(name) {
      if(name in this.simplemde) {
        this.simplemde[name]()
      }
    }
  }
}
</script>

<style lang="scss">
@import '~simplemde/dist/simplemde.min.css';
@import '../../scss/override';

.editor-root {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  .editor-slide {
    flex: 1;
    display: flex;
    flex-direction: column;
    .control {
      flex: 1;
      display: flex;
      flex-direction: column;
      .CodeMirror {
        box-shadow: inset 0 1px 2px rgba($black, 0.1);
        max-height: none !important;
        flex: 1;
        display: flex;
        flex-direction: column;
        border-radius: 0;
        resize: none;
        .CodeMirror-scroll {
          flex: 1;
          width: 100%;
          margin: 0;
          overflow: hidden !important;
          box-sizing: border-box;
        }
        &.CodeMirror-focused {
          border-color: $link;
          box-shadow: 0 0 0 0.125em rgba($link, 0.25);
        }
      }
    }
  }
}

</style>
