<template>
  <div>
    <a href="#" @click="addSlide()" class="navbar-item">
      <span class="icon">
        <i class="fa fa-plus"></i>
      </span>
      New slide
    </a>
    <a href="#" class="navbar-item" @click="openPreview()"
      :class="{ disabled: !file.slides.length }">
      <span class="icon">
        <i class=" fa fa-external-link"></i>
      </span>
      Preview
    </a>
    <template v-if="file.slides.length">
      <span class="navbar-item separator"></span>
      <template
        v-for="(button, index) in editorButtons">
        <a href="#"
          :key="index"
          class="navbar-item"
          :class="{
            'is-active': app.cursor[button.mode],
          }"
          :title="makeTitle(button)"
          @click="sendAction(button.action)"
          v-if="button.action">
          <span>
            <i class="fa" :class="`fa-${button.icon}`"></i>
          </span>
        </a>
        <span class="navbar-item separator" v-else :key="index"></span>
      </template>
    </template>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import bus, { EVENTS } from '../../bus'

export default {
  data() {
    return {
      editorButtons: [
        { icon: 'bold', mode: 'bold', action: 'toggleBold', shortcut: 'Ctrl-B', label: 'Bold' },
        { icon: 'italic', mode: 'italic', action: 'toggleItalic', shortcut: 'Ctrl-I', label: 'Italic' },
        { icon: 'strikethrough', mode: 'strikethrough', action: 'toggleStrikethrough', label: 'Strike Through' },
        { icon: 'header', mode: 'heading', action: 'toggleHeadingSmaller', shortcut: 'Ctrl-H', label: 'Heading' },
        {},
        { icon: 'code', mode: 'code', action: 'toggleCodeBlock', shortcut: 'Ctrl-Alt-C', label: 'Code' },
        { icon: 'quote-left', mode: 'quote', action: 'toggleBlockquote', shortcut: 'Ctrl-\'', label: 'Quote' },
        { icon: 'list-ul', mode: 'unordered-list', action: 'toggleUnorderedList', shortcut: 'Ctrl-L', label: 'Genelic List' },
        { icon: 'list-ol', mode: 'ordered-list', action: 'toggleOrderedList', shortcut: 'Ctrl-Alt-L', label: 'Numbered List' },
        {},
        { icon: 'link', mode: 'link', action: 'drawLink', shortcut: 'Ctrl-K', label: 'Create Link' },
        { icon: 'picture-o', mode: 'picture', action: 'drawImage', shortcut: 'Ctrl-Alt-I', label: 'Insert Image' },
        { icon: 'table', mode: 'table', action: 'drawTable', label: 'Insert Table' },
        { icon: 'minus', mode: 'horizontal-rule', action: 'drawHorizontalRule', label: 'Insert Horizontal Rule' },
      ]
    }
  },
  computed: {
    ...mapState(['app', 'file'])
  },
  mounted() {
    // fix title
    // https://github.com/sparksuite/simplemde-markdown-editor/blob/1.11.2/src/js/simplemde.js#L97
    this.editorButtons = this.editorButtons.map(button => {
      if(this.app.shortcutisMac) {
        button.shortcut = button.shortcut
          .replace('Ctrl', '⌘').replace('Alt', '⌥')
      }
      return button
    })
  },
  methods: {
    sendAction(action) {
      if(!this.file.slides.length) return
      bus.$emit(EVENTS.EDITOR.SEND_ACTION, action)
    },
    ...mapActions('file', ['addSlide']),
    ...mapMutations('app', ['openPreview']),
    makeTitle(menuItem) {
      return `${menuItem.label}${menuItem.shortcut && ` (${menuItem.shortcut})` || ''}`
    }
  }
}
</script>
<style scoped lang="scss">
@import '~bulma/sass/utilities/initial-variables';


.disabled {
  opacity: .5;
  pointer-events: none;

}
</style>
