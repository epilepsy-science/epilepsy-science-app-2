<template>
  <div class="container">
    <div class="heading2 subpage">
      Dataset does not exist anymore: <b>{{datasetName}}</b>
      <hr class="my-16"/>
      <div class="heading3">
        The dataset with the identifier: <b>{{ doiUrl }}</b> was removed on {{ unpublishedDate }} and is no longer available on the Epilepsy.science portal.
        <br/>
        <!-- TODO: add Epilepsy.science related content below -->
        Please refer to the <a href="https://docs.pennsieve.io/" target="_blank">List of datasets Removed from the Epilepsy.science Portal</a>
        for its full bibliographic citation and its statement of unavailability. For information on Epilepsy.science's policy on dataset removal, please refer to the Removal of Published Data section of the <a href="https://docs.pennsieve.io/" target="_blank">Epilepsy.science Changes to Published Datasets Policy</a>.
      </div>
    </div>
  </div>
</template>

<script>

import { propOr } from 'ramda'
import DateUtils from '@/mixins/format-date'

export default {
  name: 'Tombstone',
  mixins: [DateUtils],
  props: {
    datasetDetails: {
      type: Object,
      default: () => {}
    },
  },
  computed: {
    datasetName: function() {
      return propOr('', 'name', this.datasetDetails)
    },
    doiUrl: function() {
      return `https://doi.org/${this.doi}`
    },
    doi: function() {
      return this.datasetDetails.doi
    },
    unpublishedDate: function () {
      return this.formatDate(this.datasetDetails.updatedAt)
    }
  },
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
hr {
  border-top: none;
  border-color: $lineColor1;
}
.subpage {
  margin-bottom: 1rem;
  margin-top: 1rem;
  padding: 1.5rem;
}
</style>
