<template>
  <div class="files-footer">
    <div class="files-button">
      <p><strong>{{ fileCountMessage }}</strong></p>
      <bf-button
        v-if="showLoadMore"
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
    totalFileCount: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      default: 100
    },
    loadedFileCount: {
      type: Number,
      default: 0
    }
  },

  computed: {
    fileCountMessage() {
      return `1 - ${this.loadedFileCount} of ${this.totalFileCount} files`
    },
    showLoadMore() {
      return this.totalFileCount > this.limit && this.loadedFileCount !== this.totalFileCount
    },
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
