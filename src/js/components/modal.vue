<template>
  <div class="modal" v-show="active" :class="{ 'is-active': active }" @submit="ok">
    <transition name="fade" @enter="active = true" @after-leave="active = false">
      <div class="modal-background" @click="close" v-show="show"></div>
    </transition>
    <transition name="slide">
      <div class="modal-card" v-show="show">
        <header class="modal-card-head">
          <h1 class="modal-card-title"><slot name="title">{{title}}</slot></h1>
          <button class="delete" aria-label="close" @click="close"></button>
        </header>
        <section class="modal-card-body">
          <slot>
            <p>{{body}}</p>
          </slot>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="close" v-if="cancel">Cancel</button>
          <button class="button is-primary" @click="ok" ref="ok">OK</button>
        </footer>
      </div>
    </transition>
  </div>
</template>
<script>
import bus, { EVENTS } from '../bus'

export default {
  props: {
    cancel: {
      type: Boolean,
      default: true
    },
    event: {
      type: String,
      default: EVENTS.MODAL.OPEN
    }
  },
  data() {
    return {
      show: false,
      active: false,
      callback: null,
      title: null,
      body: null
    }
  },
  mounted() {
    bus.$on(this.event, this.open)
  },
  methods: {
    async open(payload = {}) {
      const { callback, title, body } = payload
      this.callback = callback
      this.title = title
      this.body = body
      this.show = true
      await this.$nextTick()
      if(this.$refs.ok)
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
