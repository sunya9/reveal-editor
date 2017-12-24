<template>
  <li @click="setIndices({ h: index })"
      v-shortkey.native="{ up: ['arrowup'], down: ['arrowdown'] }"
      @shortkey="move">
    <div class="card" :class="{
        active: active(index)
      }">
      <header class="card-header">
        <h3 class="card-header-title"><span>{{title}}</span></h3>
        <span href="#" class="card-header-icon" aria-label="delete">
          <a href="#" class="delete"
            @click.stop.prevent="$emit('remove')"></a>
        </span>
      </header>
      <div class="card-content content is-size-7" v-html="body"></div>
    </div>
    <!-- TODO: nested
    <div v-if="hasChildren">
      <slide-card-list :children="slide.children"  />
    </div>
     -->
  </li>
</template>
<script>
import marked from 'marked'
import { mapState, mapMutations } from 'vuex'
import SlideCardList from './slide-card-list.vue'
import { getPlainTitleFromBody, makeBlobRenderer } from '../util'

export default {
  props: {
    removable: Boolean,
    slide: Object,
    index: Number,
    hasChildren: Boolean
  },
  computed: {
    ...mapState('app', ['indices']),
    title() {
      return getPlainTitleFromBody(this.slide.body)
    },
    body() {
      const [, ...body] = this.slide.body.split(/\n+/)
      const renderer = makeBlobRenderer(false)
      return marked(body.join('\n'), { renderer })
    }
  },
  beforeCreate() {
    // TODO: nested slide
    // if(this.hasChildren) {
    //   this.$options.components.SlideCardList = require('./slide-card-list.vue')
    // }
  },
  methods: {
    ...mapMutations('app', ['setIndices']),
    active(index) {
      const res = this.indices.h === index
      if(res && this.$el) {
        this.$emit('selected', this.$el.offsetTop, this.$el.offsetHeight)
      }
      return res
    },
    move(e) {
      // switch(e.srcKey) {
      // case 'up': {
      //   this.setIndices({ h: this.indices.h - 1 })
      //   break
      // }
      // case 'down': {
      //   this.setIndices({ h: this.indices.h + 1 })
      //   break
      // }
      // }
    }
  },
  components: {
    SlideCardList
  }
}
</script>

<style lang="scss" scoped>
@import '~bulma/sass/utilities/initial-variables';

.card {
  margin-bottom: 1rem;
}
.disabled {
  pointer-events: none;
  cursor: not-allowed;
}
.active {
  outline: 1px solid $orange;
}
.card-content {
  padding: .5rem;
  overflow: hidden;
  height: 3rem;
  pointer-events: none;
}
</style>
