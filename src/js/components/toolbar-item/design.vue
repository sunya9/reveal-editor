<template>
  <div>
    <div class="navbar-item">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label" for="theme">Theme</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <div class="select">
                <select v-model="localTheme" id="theme">
                  <option v-for="theme in themes" :key="theme">{{theme}}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="navbar-item">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label" for="syntax-theme">Syntax theme</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <div class="select">
                <select v-model="localSyntaxTheme" id="syntax-theme">
                  <option v-for="theme in syntaxThemes" :key="theme">{{theme}}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="navbar-item separator"></div>
    <a href="#" class="navbar-item" @click="openConfig">
      <span class="icon">
        <i class="fa fa-cog"></i>
      </span>
      Reveal options
    </a>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import syntaxThemes from './syntax-themes'
import bus, { EVENTS } from '../../bus'

export default {
  data() {
    return {
      themes: [
        'white',
        'black',
        'beige',
        'blood',
        'league',
        'moon',
        'night',
        'serif',
        'simple',
        'sky',
        'solarized'
      ],
      syntaxThemes
    }
  },
  computed: {
    ...mapState('file', ['theme', 'syntaxTheme']),
    localTheme: {
      get() {
        return this.theme
      },
      set(theme) {
        return this.updateTheme(theme)
      }
    },
    localSyntaxTheme: {
      get() {
        return this.syntaxTheme
      },
      set(theme) {
        return this.updateSyntaxTheme(theme)
      }
    }
  },
  methods: {
    ...mapMutations('file', ['updateTheme', 'updateSyntaxTheme']),
    openConfig() {
      bus.$emit(EVENTS.CONFIG_MODAL.OPEN)
    }
  }
}
</script>
<style scoped>
.field-label {
  flex-grow: 5;
}
</style>

