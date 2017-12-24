<template>
  <div>
    <div draggable="true" @dragstart.stop="dragstart"
      class="card" v-for="(asset, index) in assets"
      :key="asset.name"
      :data-name="asset.name" :data-type="asset.type">
      <header class="card-header">
        <h3 class="card-header-title"><span>{{asset.name}}</span></h3>
        <span class="card-header-icon" aria-label="delete">
            <a href="#" class="delete" @click="removeConfirm(index)"></a>
        </span>
      </header>
      <div class="card-image" v-if="asset.type.startsWith('image')">
        <figure class="image">
          <img draggable="false" :src="asset.url" :alt="asset.name">
        </figure>
      </div>
    </div>
  </div>
</template>
<script>
import bus, { EVENTS } from '../bus'
import { mapState, mapActions, mapGetters } from 'vuex'
export default {
  computed: {
    ...mapState('file', ['assets']),
    ...mapGetters('file', ['getAssetPath'])
  },
  methods: {
    ...mapActions('file', ['removeAsset']),
    removeConfirm(index) {
      bus.$emit(EVENTS.MODAL.OPEN, {
        callback: () => this.remove(index),
        title: 'Remove',
        body: `Are you sure you want to remove ${this.assets[index].name}?`
      })
    },
    remove(index) {
      // TODO: remove file
      this.removeAsset(index)
    },
    dragstart(e) {
      const { name, type } = e.target.dataset
      if(!type.startsWith('image')) return
      e.dataTransfer.effectAllowed = 'copylink'
      e.dataTransfer.setData('text/plain', `![${name}](${getAssetPath(name)})`)
    }
  }
}
</script>

<style scoped>
.modal-card-foot {
  justify-content: flex-end;
}
.is-ancestor {
  flex-wrap: wrap;
}

img {
  object-fit: cover;
  height: 100px;
}
.card {
  margin-bottom: 1rem;
}
</style>
