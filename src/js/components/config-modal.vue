<template>
  <modal :cancel="false" :event="EVENTS.CONFIG_MODAL.OPEN">
    <span slot="title">Reveal options</span>
    <form @submit.prevent>
      <div class="field is-horizontal"
        v-for="option in options"
        :key="option.key">
        <div class="field-label"
          :class="{ 'is-normal': option.type !== 'checkbox' }">
          <label class="label">{{option.key}}</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <label v-if="option.type === 'checkbox'"
                class="checkbox">
                <input type="checkbox"
                  :checked="storeOptions[option.key] !== undefined ? storeOptions[option.key] : option.default"
                  v-bind="option.props"
                  @change="e => updateOptions({ [option.key]: e.target.checked })">
              </label>
              <input :type="option.type" v-if="/text|number/.test(option.type)"
                class="input"
                :value="storeOptions[option.key] !== undefined ? storeOptions[option.key] : option.default"
                v-bind="option.props"
                @input="e => updateOptions({ [option.key]: option.type === 'number' ? Number(e.target.value) : e.target.value })"
                >
              <div class="select is-fullwidth"
                v-if="option.type === 'select'"
                v-bind="option.props"
                @change="e => updateOptions({ [option.key]: e.target.value })">
                <select :value="storeOptions[option.key] !== undefined ? storeOptions[option.key] : option.default">
                  <option v-for="op in option.options" :key="op">{{op}}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <input type="submit" value="" class="hidden">
    </form>
  </modal>
</template>
<script>
import Modal from './modal.vue'
import bus, { EVENTS } from '../bus'
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      EVENTS,
      options: [
        { key: 'width', type: 'number', default: null },
        { key: 'height', type: 'number', default: null },
        { key: 'maxScale', type: 'number', props: { step: 0.1 }, default: null },
        { key: 'minScale', type: 'number', props: { step: 0.1 }, default: null },
        { key: 'controls', type: 'checkbox', default: true },
        { key: 'controlsTutorial', type: 'checkbox', default :true },
        { key: 'controlsLayout', type: 'select', options: ['bottom-right', 'edges'], default: 'bottom-right' },
        { key: 'controlsBackArrows', type: 'select', options: ['faded', 'hidden', 'visible'], default: 'faded' },
        { key: 'progress', type: 'checkbox', default: true },
        { key: 'defaultTiming', type: 'number', default: 120 },
        { key: 'slideNumber', type: 'select', options: ['h.v', 'h/v', 'c', 'c/t', ''], default: '' },
        { key: 'showSlideNumber', type: 'select', options: ['all', 'speaker', 'print'], default: 'all' },
        { key: 'history', type: 'checkbox', default: false },
        { key: 'keyboard', type: 'checkbox', default: true },
        { key: 'overview', type: 'checkbox', default: true },
        { key: 'center', type: 'checkbox', default: true },
        { key: 'touch', type: 'checkbox', default: true },
        { key: 'loop', type: 'checkbox', default: false },
        { key: 'rtl', type: 'checkbox', default: false },
        { key: 'shuffle', type: 'checkbox', default: false },
        { key: 'fragments', type: 'checkbox', default: true },
        { key: 'embedded', type: 'checkbox', default: false },
        { key: 'help', type: 'checkbox', default: true },
        { key: 'showNotes', type: 'checkbox', default: false },
        { key: 'autoPlayMedia', type: 'select', options: [true, false, null], default: null },
        { key: 'autoSlide', type: 'number', default: 0 },
        { key: 'autoSlideStoppable', type: 'checkbox', default: true },
        // unsupported option
        // { key: 'autoSlideMethod', type: 'checkbox', default: true },
        { key: 'mouseWheel', type: 'checkbox', default: false },
        { key: 'hideAddressBar', type: 'checkbox', default: true },
        // { key: 'previewLinks', type: 'checkbox', default: false },
        { key: 'transition', type: 'select', options: ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'], default: 'slide' },
        { key: 'transitionSpeed', type: 'select', options: ['default', 'fast', 'slow'], default: 'default' },
        { key: 'backgroundTransition', type: 'select', options: ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'], default: 'fade' },
        { key: 'viewDistance', type: 'number', default: 3 },
        { key: 'parallaxBackgroundImage', type: 'text', default: '' },
        { key: 'parallaxBackgroundSize', type: 'text', default: '' },
        { key: 'parallaxBackgroundHorizontal', type: 'text', default: null },
        { key: 'parallaxBackgroundVertical', type: 'text', default: null },
        { key: 'display', type: 'text', default: 'block' },
      ]
    }
  },
  computed: {
    ...mapState({
      storeOptions: state => state.file.options
    }),
  },
  methods: {
    ...mapMutations('file', ['updateOptions'])
  },
  components: {
    Modal
  }
}
</script>
<style scoped>
.field-label, .field-body {
  flex: 1;
}
</style>


