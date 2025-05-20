<template>
  <div class="files-footer">
    <div class="files-button">
      <p>
        <strong>{{ loadedCount }}</strong> of
        <strong>{{ fileCount }}</strong> files
      </p>

      <bf-button
        v-if="fileCount > limit && files.length !== fileCount"
        @click="loadMoreFiles"
      >
        Load More
      </bf-button>
    </div>
  </div>
</template>

<script>
import BfButton from '~/components/Shared/BfButton/BfButton.vue'
export default {
  name: 'DatasetFilesFooter',

  components: {
    BfButton
  },

  props: {
    files: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: 100
    },
    fileCount: {
      type: Number,
      default: 0
    },
    loadedCount: {
      type: String,
      default: ''
    }
  },

  methods: {
    /**
     * Loads more dataset files
     */
    loadMoreFiles() {
      this.$emit('load-more-files')
    }
  }
}
</script>

<style lang="scss" scoped>
.files-button {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  p {
    margin-right: 15px;
    font-size: 12px;
    margin-top: 28px;
  }

  .bf-button {
    margin-top: 16px;
    min-width: 0;
  }
}
</style>
