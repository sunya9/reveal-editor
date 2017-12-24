<template>
  <div class="tile is-2 flex-column">
    <div class="tile is-parent scrollable-wrapper">
      <component :is="list" />
    </div>
    <div class="tabs is-fullwidth">
      <ul>
        <li :class="{ 'is-active': list === 'slide-card-list' }">
          <a href="#" @click="list = 'slide-card-list'">
            Slides
            <span class="tag is-rounded">{{slides.length}}</span>
          </a>
        </li>
        <li :class="{ 'is-active': list === 'asset-list' }">
          <a href="#" @click="list = 'asset-list'">
            Assets
            <span class="tag is-rounded">{{assets.length}}</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import AssetList from './asset-list.vue'
import SlideCardList from './slide-card-list.vue'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      list: 'slide-card-list'
    }
  },
  computed: {
    ...mapState('file', ['slides', 'assets'])
  },
  components: {
    AssetList, SlideCardList
  }
}
</script>

<style scoped>
.scrollable-wrapper {
  min-height: 0;
  overflow-x: visible;
  overflow-y: scroll;
  flex-direction: column;
  margin: 0.75rem 0;
}
.tabs {
  padding-bottom: 1rem;
  margin-right: 15px;
}
.flex-column {
  flex-direction: column;
  min-width: 240px;
}
</style>
