<template>
  <div class="modal" v-if="show" :class="{ 'is-active': show }">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="box">
        <progress class="progress" :value="val" max="100"></progress>
      </div>
    </div>
  </div>
</template>

<script>
import bus, { EVENTS } from '@renderer/bus'
export default {
  data() {
    return {
      val: 0,
      show: false
    }
  },
  mounted() {
    bus.$on(EVENTS.PROGRESSBAR_MODAL.OPEN, this.open)
    bus.$on(EVENTS.PROGRESSBAR_MODAL.CLOSE, this.close)
    bus.$on(EVENTS.PROGRESSBAR_MODAL.PROGRESS, this.progress)
  },
  beforeDestroy() {
    bus.$off(EVENTS.PROGRESSBAR_MODAL.OPEN, this.open)
    bus.$off(EVENTS.PROGRESSBAR_MODAL.CLOSE, this.close)
    bus.$off(EVENTS.PROGRESSBAR_MODAL.PROGRESS, this.progress)
  },
  methods: {
    open(initialValue = 0) {
      this.show = true
      this.val = initialValue
    },
    progress(val) {
      this.val = val
    },
    close() {
      this.show = false
    }
  }
}
</script>
<style scoped>
progress {
  transition: all .5s ease;
}
</style>
