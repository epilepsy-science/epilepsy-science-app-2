<template>
  <div class="dataset-tombstone">
    <div class="discover-content container-fluid">
      <div class="row">
        <div class="col-xs-12 col-sm-6">
          <div class="dataset-img">
            <img
              src="../../../../assets/images/illustrations/icon-broken-image.svg"
              alt="Empty dataset banner"
              height="211"
              width="158"
            />
          </div>
        </div>
        <div class="col-xs-12 col-sm-6">
          <h1>This dataset is no longer available on Discover.</h1>
          <p class="mb-16">
            <strong>“{{ datasetName }}.”</strong> has been unpublished by it’s
            owner and is no longer available on Pennsieve Discover.
          </p>

          <p v-if="filteredTags.length" class="mb-16">
            You can browse all datasets or view similarly tagged datasets in:
          </p>

          <tag-list :tags="filteredTags" />
        </div>
      </div>
      <dataset-version-message
        v-if="!isLatestVersion && hasVersions"
        :current-version="currentVersion"
        :dataset-details="datasetDetails"
        :is-tomb-stone="true"
      />
    </div>
  </div>
</template>

<script>
import { pluck, propOr } from 'ramda'

import TagList from '~/components/Dataset/TagList/TagList.vue'
import DatasetVersionMessage from '../../Dataset/DatasetVersionMessage/DatasetVersionMessage.vue'

export default {
  name: 'DatasetTombstone',

  components: {
    TagList,
    DatasetVersionMessage
  },

  props: {
    tags: {
      type: Array,
      default: () => [],
    },
    showSignupFooter: {
      type: Boolean,
      default: false
    },
    datasetDetails: {
      type: Object,
      default: () => {}
    },
    versions: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    /**
     * Compute dataset name
     */
    datasetName() {
      return propOr('', 'name', this.datasetDetails)
    },

    /**
     * Returns list of tags for dataset
     * @returns {Array}
     */
    filteredTags() {
      const datasetTags = propOr([], 'tags', this.datasetDetails)

      const allTags = pluck('tag', this.tags)

      return datasetTags.filter((tag) => {
        return allTags.includes(tag)
      })
    },

    /**
     * True if the dataset has been published
     * @returns {Boolean}
     */
    hasVersions() {
      return this.versions.length > 0
    },

    /**
     * Version being searched for
     * @returns {Number}
     */
    currentVersion() {
      return propOr('', 'version', this.datasetDetails)
    },

    /**
     * Latest published version for dataset
     * @returns {Number}
     */
    latestVersion() {
      return this.hasVersions ? this.versions.slice(-1).pop().version : ''
    },

    /**
     * False if the version being searched
     * for is not the latest version
     * @returns {Boolean}
     */
    isLatestVersion() {
      return this.currentVersion === this.latestVersion
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variables';

h1 {
  font-size: 32px;
  font-weight: 700;
  line-height: 40px;
  margin-bottom: 24px;
}
p {
  font-size: 16px;
  line-height: 24px;
}

.dataset-tombstone {
  padding: 80px 0;
}
.dataset-img {
  align-items: center;
  background: #f9f9f9;
  border: 1px solid variables.$cortex;
  display: flex;
  justify-content: center;
  padding-top: 100%;
  position: relative;
  width: 100%;
  @media (max-width: 48em) {
    margin-bottom: 32px;
  }
  img {
    margin-top: -25%;
    position: absolute;
    top: 50%;
    @media (max-width: 48em) {
      height: 50%;
      width: 50%;
    }
  }
}
:deep(.tag-list-tag) {
  background: variables.$axon;
  color: #000;
  &:hover,
  &:focus {
    background-color: variables.$dendrite;
  }
}
</style>
