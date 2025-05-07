<template>
  <div class="files-header">
    <div class="row end-xs">
      <div class="col-xs file-path">
        <div v-if="filePath.length >= filePathLimit">
          <breadcrumb-navigation
            :directory-list="filePath"
            @navigate-breadcrumb="handleNavigateBreadcrumb"
          />
        </div>
        <div
          v-for="(path, index) in filePath"
          v-else
          :key="`${path}-${index}`"
          class="path"
        >
          <div
            v-if="index === filePath.length - 1"
            :class="[
              path === 'Root Directory' ? 'path-regular' : 'path-strong'
            ]"
          >
            {{ path }}
          </div>
          <div v-else>
            <a href="#" @click.prevent="getDatasetFilesForPath(path, index)">{{
              path
            }}</a
            >/
          </div>
        </div>
      </div>
      <div
        :class="[
          fileCount > limit && files.length !== fileCount
            ? 'col-xs-3 file-count'
            : 'col-xs-2 file-count'
        ]"
      >
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
  </div>
</template>

<script>
import BfButton from '~/components/Shared/BfButton/BfButton.vue'
import BreadcrumbNavigation from '../../Dataset/BreadcrumbNavigation/BreadcrumbNavigation.vue'
export default {
  name: 'DatasetFilesHeader',

  components: {
    BreadcrumbNavigation,
    BfButton
  },

  props: {
    filePath: {
      type: Array,
      default: () => ['Root Directory']
    },
    fileCount: {
      type: Number,
      default: 0
    },
    files: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: 100
    },
    loadedCount: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      filePathLimit: 4,
      breadcrumbPath: false
    }
  },

  methods: {
    /**
     *  Loads dataset files for a directory path from the
     *  the breadcrumb dropdown
     * @param {Object} obj
     * @param {Object} filePathRemainder
     */
    handleNavigateBreadcrumb(obj, filePathRemainder) {
      if (obj.pathName !== '' && obj.index !== '') {
        if (
          obj.pathName.includes('Root Directory') &&
          obj.directoryName !== 'Root Directory'
        ) {
          // need to get rid of this and reformat
          obj.pathName.shift('Root Directory')
          const finalPathList = Array.from(obj.pathName)
          const path = obj.pathName.join('/')

          this.$emit(
            'get-path-dataset-files',
            path,
            obj.directoryName,
            obj.index,
            false,
            finalPathList
          )
        } else {
          this.$emit(
            'get-path-dataset-files',
            obj.pathName,
            obj.directoryName,
            obj.index,
            false,
            filePathRemainder
          )
        }
      } else {
        this.$emit('get-path-dataset-files', 'Root Directory')
      }
    },

    /**
     * Loads dataset files for a directory path from the
     * file route string
     * @param {String} pathName
     * @param {Number} index
     */
    getDatasetFilesForPath(pathName, index) {
      // this is for regular path
      this.$emit('get-path-dataset-files', pathName, pathName, index)
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
