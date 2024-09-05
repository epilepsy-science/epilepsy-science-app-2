<template>
  <div v-loading="loadingMarkdown" class="dataset-description-info">
    <div
      class="description-container"
      v-html="parseMarkdown(markdown.markdownTop)"
    />
    <div
      v-if="markdown.markdownBottom"
      class="description-container"
      v-html="parseMarkdown(markdown.markdownBottom)"
    />
    <hr>
    <div class="mb-16">
      <sparc-tooltip
        v-if="datasetInfo.embargo"
        placement="left-center"
      >
        <template #data>
          <!-- TODO - Not urgent: find if embargoed datasets supported in epilepsy.science -->
          <!-- <div v-if="embargoed && embargoAccess !== EMBARGO_ACCESS.GRANTED">
            This dataset is currently <a href="https://docs.sparc.science/docs/embargoed-data" target="_blank">embargoed</a>.<br />SPARC datasets are subject to a 1-year<br />embargo during which time the datasets<br />are visible only to members of the<br />SPARC consortium. During embargo, the<br />public will be able to view basic<br />metadata about these datasets as well<br />as their release date.
          </div> -->
        </template>
      </sparc-tooltip>
    </div>
  </div>
</template>

<script>
import marked from '@/mixins/marked/index'
import { mapState } from 'pinia'
import { useMainStore } from '../../store'
import { propOr } from 'ramda'
import _ from 'lodash'
import axios from 'axios'
import { EMBARGO_ACCESS } from '@/utils/constants'

export default {
  name: 'DatasetDescriptionInfo',

  mixins: [marked],

  props: {
    loadingMarkdown: {
      type: Boolean,
      default: false
    },
    markdown: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    ...mapState(useMainStore, ['datasetInfo']),
    EMBARGO_ACCESS() {
      return EMBARGO_ACCESS
    },
    embargoAccess() {
      return propOr(null, 'embargoAccess', this.datasetInfo)
    },
    embargoed: function() {
      return propOr(false, 'embargo', this.datasetInfo)
    },
    /**
     * Gets dataset id
     * @returns {Number}
     */
    datasetId: function() {
      return propOr(0, 'id', this.datasetInfo)
    },
    /**
     * Gets dataset version
     * @returns {Number}
     */
    versionId: function() {
      return propOr(0, 'version', this.datasetInfo)
    }
  },

  methods: {
    downloadItem({ url, label }) {
      axios.get(url, { responseType: "blob" }).then(response => {
        const blob = new Blob([response.data], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = label;
        link.click();
        URL.revokeObjectURL(link.href);
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.dataset-description-info {
  overflow-wrap: anywhere;
  word-wrap: normal;
  :deep(hr){
    margin-top: 1rem;
    border-top: none;
  }
  :deep(p:first-of-type) {
    margin-top: 0;
  }
  .keywords {
    p {
      display: inline-block;
      margin: 0;
    }
    p:first-letter {
      text-transform: uppercase;
    }
  }

  .experimental-design-container {
    padding-left: 2rem;
    display: flex;
    a {
      text-decoration: underline;
    }
    @media (max-width: 48em) {
      flex-direction: column;
    }
    .experimental-design-section-text-column {
      min-width: 6.75rem;
    }
  }
}
</style>
