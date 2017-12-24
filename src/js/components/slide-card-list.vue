<template>
  <draggable
    element="ol"
    @end="dragEnd"
    :options="{
      forceFallback: true // for ghost
    }"
    :list="slides">
    <slide-card
      v-for="(slide, index) in slides"
      :key="index"
      class="slide-card"
      @remove="remove(index)"
      :index="index"
      :removable="slides.length > 1"
      :has-children="parent"
      @selected="scroll"
      :slide="slide" />
  </draggable>
</template>
<script>
import SlideCard from './slide-card.vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import Draggable from 'vuedraggable'
import bus, { EVENTS } from '../bus'

export default {
  props: {
    parent: Boolean
  },
  computed: {
    slides: {
      get() {
        return this.$store.state.file.slides
      },
      set(slides) {
        this.updateSlides(slides)
      }
    },
    indices() {
      return this.$store.state.app.indices
    }
  },
  methods: {
    ...mapMutations('app', ['setIndices']),
    ...mapActions('file', ['removeSlide']),
    ...mapMutations('file', ['updateSlides']),
    remove(index) {
      const { body, note } = this.slides[index]
      if(!body && !note) {
        this.removeSlide(index)
      } else {
        bus.$emit(EVENTS.MODAL.OPEN, {
          callback: () => this.removeSlide(index),
          title: 'Remove',
          body: `Are you sure you want to remove the slide ${index + 1}?`
        })
      }
    },
    dragEnd({ newIndex, oldIndex }) {
      const h = this.indices.h === oldIndex
        ? newIndex
        : (this.indices.h < oldIndex && this.indices.h < newIndex)
          || (this.indices.h > oldIndex && this.indices.h > newIndex)
          ? this.indices.h
          : newIndex < oldIndex
            ? this.indices.h + 1
            : this.indices.h - 1
      this.setIndices({ h })
    },
    scroll(offsetTop, height) {
      const { parentElement } = this.$el
      const { scrollTop } = parentElement
      if(offsetTop -30 < scrollTop) {
        parentElement.scrollTop = offsetTop - 30
      } else if(parentElement.offsetHeight + scrollTop < offsetTop + height) {
        const more = offsetTop - (parentElement.offsetHeight + scrollTop)
        parentElement.scrollTop = scrollTop + more + height
      }
    }
  },
  // TODO: nested
  // beforeCreate() {
  //   this.$options.components.Draggable = require('vuedraggable')
  //   this.$options.components.SlideCard = require('./slide-card.vue')
  // },
  components: {
    SlideCard,
    Draggable
  }
}
</script>

<style scoped lang="scss">
ol {
  list-style-type: none;
  counter-reset: card;
  li {
    position: relative;
    margin-left: 2rem;
    &:before {
      counter-increment: card;
      content: counter(card);
      position: absolute;
      top: .2rem;
      right: calc(100% + .5rem);
    }
    &.sortable-fallback:before {
      content: '';
    }
  }
}
.slide-card {
  cursor: pointer;
}
</style>
