<template>
  <div v-shortkey="{ closePreview: ['esc'] }" @shortkey="shortcut" class="holygrail">
    <nav class="navbar">
      <div class="container is-fluid">
        <div class="navbar-menu">
          <div class="navbar-start">
            <div class="navbar-item">
              {{formattedElapsed}}
            </div>
            <a href="#" class="navbar-item" @click="toggleTimer">
              <span class="icon">
                <i class="fa"
                  :class="timer.state ? 'fa-pause' : 'fa-play'">
                </i>
              </span>
            </a>
            <a href="#" class="navbar-item" @click="resetTimer">
              <span class="icon"><i class="fa fa-refresh"></i></span>
            </a>
          </div>
          <div class="navbar-end">
            <a class="navbar-item" href="#" @click="toggleAmpm">
              {{formattedCurrentTime}}
            </a>
            <div class="navbar-item">
              <button class="button is-danger is-outlined" @click="closePreview">
                <span class="icon"><i class="fa fa-sign-out"></i></span>
                <span>
                  Exit
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <div class="holygrail-contents container is-fluid">
      <div class="tile is-ancestor">
        <div class="tile is-8 is-parent">
          <div class="tile is-child">
            <preview :reveal-options="{
                keyboard: true,
              }"
              @progress="p => progress = p"
              :event-target="$store.getters['app/frame']" />
          </div>
        </div>
        <div class="tile is-4 is-vertical is-parent">
          <div class="tile is-child flex-0">
            <div class="message">
              <div class="message-header">
                <h3>Next slide</h3>
              </div>
              <div class="message-body">
                <preview next-slide :reveal-options="{
                    keyboard: false,
                    progress: false,
                    controls: false
                  }"
                  view-next-slide
                  :style="{ visibility: existNext ? 'visible' : 'hidden' }" />
              </div>
            </div>
          </div>
          <div class="tile is-child scrollable">
            <div class="content">
              <p>
                {{note}}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import 'moment-duration-format'
import { mapMutations } from 'vuex'
import Preview from './preview.vue'

export default {
  data() {
    return {
      timer: {
        id: null,
        state: false,
        elapsed: 0,
        now: moment(),
        ampm: true
      },
      progress: 0
    }
  },
  mounted() {
    this.timer.id = setInterval(this.updateTimer, 1000)
    this.timer.state = true
  },
  beforeDestroy() {
    clearInterval(this.timer.id)
  },
  computed: {
    formattedElapsed() {
      return moment
        .duration(this.timer.elapsed, 'second')
        .format('hh:mm:ss', { trim: false })
    },
    formattedCurrentTime() {
      return moment(this.timer.now)
        .format(this.timer.ampm ? 'hh:mm A' : 'HH:mm')
    },
    note() {
      return this.$store.getters['file/selectedSlide'].note
    },
    existNext() {
      return this.progress < 1
    }
  },
  methods: {
    ...mapMutations('app', ['closePreview']),
    toggleTimer() {
      this.timer.state = !this.timer.state
    },
    updateTimer() {
      this.timer.now = moment()
      if(!this.timer.state) return
      this.timer.elapsed++
    },
    resetTimer() {
      clearInterval(this.timer.id)
      this.timer.id = setInterval(this.updateTimer, 1000)
      this.timer.elapsed = 0
    },
    toggleAmpm() {
      this.timer.ampm = !this.timer.ampm
    },
    shortcut({ srcKey }) {
      this[srcKey] && this[srcKey]()
    }
  },
  components: {
    Preview
  }
}
</script>
<style scoped>
.scrollable {
  min-height: 0;
  overflow: auto;
}
.flex-0 {
  flex: 0;
}
.holygrail-contents {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
</style>
