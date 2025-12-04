<template>
  <div class="files-header">
    <div class="row end-xs">
      <div class="col-xs file-path">
        <div
          v-for="{name, id} in segmentedPath"
          :key="`${name}-${id}`"
          class="path"
        >
         <template v-if="id !== segmentedPath.length - 1">
          <a href="#" @click.prevent="handleNavigateBreadcrumb(id)"> {{ name }}</a>
          <span> /</span>
         </template>
         <template v-else>
          <strong>{{ name }}</strong>
         </template>
        </div>
      </div>
      <div
        :class="[
          totalFileCount > limit && loadedFileCount !== totalFileCount
            ? 'col-xs-3 file-count'
            : 'col-xs-2 file-count'
        ]"
      >
        <p>
          <strong>{{ fileCountMessage }}</strong>
        </p>

        <bf-button
          v-if="showLoadMore"
          @click="loadMoreFiles"
        >
          Load More
        </bf-button>
      </div>
    </div>
  </div>
</template>

<script>
import BfButton from '~/components/Shared/BfButton/BfButton.vue'

const ROOT_PATH_NAME = 'Root Directory'

export default {
  name: 'DatasetFilesHeader',

  components: {
    BfButton
  },

  props: {
    directoryPath: {
      type: String,
      default: ''
    },
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
    segmentedPath() {
      let path = []
      if (this.directoryPath === '') {
        path = [{name: ROOT_PATH_NAME, id: 0}]
      } else {
        path = [{name: ROOT_PATH_NAME, id: 0}]
        let segmentIndex = 1
        this.directoryPath.split('/').forEach((segment) => {
          path.push({name: segment, id: segmentIndex})
          segmentIndex++
        })
      }
      return path
    }
  },

  methods: {
    handleNavigateBreadcrumb(segmentId) {
      // rebuild the directoryPath and remove 'Root Directory/' from the start
      let rebuiltPath = this.segmentedPath
        .slice(0, segmentId+1)
        .map(segment => segment.name)
        .join('/')

      if (rebuiltPath.startsWith('Root Directory/')) {
        rebuiltPath = rebuiltPath.replace(/^Root Directory\/?/, '')
      } else if (rebuiltPath === 'Root Directory') {
        rebuiltPath = ''
      }
      this.$emit('navigate-breadcrumb', rebuiltPath)
    },

    /**
     * Loads more dataset files in table
     */
    loadMoreFiles() {
      this.$emit('load-more-files')
    }
  }
}
</script>

<style lang="scss" scoped>
.files-header {
  .path-strong {
    font-weight: bold;
  }

  .path-regular {
    font-weight: normal;
  }

  .file-count {
    display: flex;
    justify-content: flex-end;
  }
  .space {
    margin-right: -38px;
  }
  .file-path {
    display: inherit;
    .path {
      margin-top: 14px;
    }
  }
  p {
    margin-right: 15px;
    font-size: 12px;
    margin-top: 11px;
    margin-bottom: 28px;
  }
  .bf-button {
    min-width: 0;
    margin-bottom: 16px;
  }
  .files-route {
    .path {
      display: inline-block;
    }
    font-size: 14px;
  }
  .files-button {
    display: flex;
    flex-direction: row;
  }
}
</style>