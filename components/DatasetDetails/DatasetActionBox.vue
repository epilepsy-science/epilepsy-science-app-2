<template>
  <div class="dataset-action-box mt-16 p-8">
    <dataset-banner-image :src="datasetImage" />
    <sparc-pill class="sparc-pill" v-if="embargoed">
      Embargoed
    </sparc-pill>
    <div class="button-container">
      <el-button
        v-if="hasFiles"
        @click="actionButtonClicked('files')"
      >
        Get Dataset
      </el-button>
      <el-button class="secondary" @click="actionButtonClicked('cite')">
        Cite Dataset
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useMainStore } from '../../store/index.js'
import { propOr } from 'ramda'
import DatasetBannerImage from '@/components/DatasetBannerImage/DatasetBannerImage.vue'
import SparcPill from '@/components/SparcPill/SparcPill.vue'

export default {
  name: 'DatasetActionBox',

  components: {
    DatasetBannerImage,
    SparcPill
  },

  computed: {
    ...mapState(useMainStore, ['datasetInfo']),
    /**
     * Returns dataset banner
     * @returns {String}
     */
    datasetImage: function() {
      return propOr('', 'banner', this.datasetInfo)
    },
    hasFiles: function() {
      return this.fileCount >= 1
    },
    fileCount: function() {
      return propOr('0', 'fileCount', this.datasetInfo)
    },
    embargoed: function() {
      return propOr(false, 'embargo', this.datasetInfo)
    }
  },

  methods: {
    /**
     * Get the dataset details tab area by id
     * @returns {Object}
     */
    getDatasetDetailsTabArea: function() {
      return document.getElementById('datasetDetailsTabsContainer')
    },
    /**
     * scroll to the dataset details tab area
     */
    scrollToDatasetDetailsTabArea: function() {
      this.getDatasetDetailsTabArea().scrollIntoView()
    },
    actionButtonClicked: function(tabId) {
      this.$router.replace({
        query: { ...this.$route.query, datasetDetailsTab: tabId }
      }).finally(() => {
        this.scrollToDatasetDetailsTabArea()
      })
    },
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.dataset-action-box {
  display: flex;
  flex-direction: column;
  border: solid 1px $lineColor1;
  text-align: center;
  background: white;
  position: relative;
  .sparc-pill {
    position: absolute;
    right: 1rem;
    top: 1rem;
  }
  button {
    margin: .25rem 0;
  }
  .button-container {
    display: flex;
    flex-direction: column;
    width: fit-content;
    align-self: center;
  }
}
</style>
