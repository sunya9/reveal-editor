<template>
  <div>
    <section class="hero is-small is-primary">
      <div class="hero-foot">
        <div class="container is-fluid">
          <nav class="tabs is-boxed">
            <ul>
              <li><a href="#" @click="$store.commit('app/showFileMenu')">File</a></li>
              <li v-for="item in tabItems" :key="item"
                :class="{
                  'is-active': tab === item
                }">
                <a href="#" @click="switchTab(item)">{{item}}</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
    <div class="navbar has-shadow">
      <div class="container is-fluid">
        <transition name="slide">
          <component :is="tab" class="navbar-tabs" />
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import Home from './toolbar-item/home.vue'
import Design from './toolbar-item/design.vue'

export default {
  data() {
    return {
      tab: 'home',
      tabItems: [
        'home',
        'design'
      ]
    }
  },
  methods: {
    switchTab(tab) {
      this.tab = tab
    }
  },
  components: {
    Home, Design
  }
}
</script>

<style lang="scss" scoped>
@import '~bulma/sass/utilities/initial-variables';

.tabs a {
  text-transform: uppercase;
}

.navbar {
  overflow: hidden;
}

.slide-enter-active, .slide-leave-active {
  transition: all .5s;
  position: absolute;
  perspective: 100px;
}
.slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
.slide-enter {
  transform: translateY(100%);
  opacity: 0;
}
.slide-enter-to {
  opacity: 1;
}
</style>
