<template>
  <div class="tile">
    <div class="tile is-parent" v-show="slides.length">
      <div class="tile is-child relative">
        <editor />
      </div>
    </div>
    <div class="tile is-parent" v-show="slides.length">
      <div class="tile is-child">
        <preview :reveal-options="{
          mouseWheel: true,
          minScale: 0.1
        }" />
      </div>
    </div>
    <div class="tile is-parent" v-show="!slides.length">
      <div class="tile is-child centering">
        <h1 class="title is-1 has-text-grey-light">Reveal editor</h1>
      </div>
    </div>
  </div>
</template>

<script>
import Editor from './editor.vue'
import Preview from './preview.vue'
import { mapState } from 'vuex'

export default {
  computed: mapState('file', ['slides']),
  components: {
    Editor,
    Preview
  }
}
</script>

<style scoped>
.centering {
  display: flex;
  align-items: center;
  justify-content: center;
}
.relative {
  position: relative;
}
</style>
