<template>
  <div class="modal" v-show="active" :class="{ 'is-active': active }">
    <transition name="fade" @enter="active = true" @after-leave="active = false">
      <div class="modal-background" @click="close" v-show="show"></div>
    </transition>
    <transition name="slide">
      <div class="modal-card" v-show="show">
        <header class="modal-card-head">
          <h1 class="modal-card-title">Remove</h1>
          <button class="delete" aria-label="close" @click="close"></button>
        </header>
        <section class="modal-card-body">
          <p>Are you sure you want to delete this item?</p>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="close">Cancel</button>
          <button class="button is-primary" @click="ok" ref="ok">OK</button>
        </footer>
      </div>
    </transition>
  </div>
</template>
<script>
import bus, { EVENTS } from '../bus'

export default {
  data() {
    return {
      show: false,
      callback: null,
      active: false
    }
  },
  mounted() {
    bus.$on(EVENTS.REMOVE_CONFIRM.OPEN, this.open)
  },
  methods: {
    async open(callback) {
      this.callback = callback
      this.show = true
      await this.$nextTick()
      this.$refs.ok.focus()
    },
    close() {
      this.show = false
    },
    ok() {
      if(this.callback) {
        this.callback()
        this.callback = null
      }
      this.close()
    }
  }
}
</script>
