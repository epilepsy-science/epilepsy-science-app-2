<template>
  <div>
    <div class="heading2 mb-8">Download Dataset</div>
    <div v-if="embargoed && userToken == null">
      This dataset is currently <a href="https://docs.sparc.science/docs/embargoed-data" target="_blank">embargoed</a>.
      SPARC datasets are subject to a 1-year
      embargo during which time the datasets
      are visible only to members of the
      SPARC consortium. During embargo, the
      public will be able to view basic
      metadata about these datasets as well
      as their release date. The embargoed release
      date for this dataset is <b>{{ embargoedReleaseDate }}</b>
      and will become available to the public on that day. To the SPARC Portal to request
      access to or view the status of an access request to embargoed data.
      <div>
        <sparc-tooltip content="Sign in to request access" placement="top-center">
          <template #item>
            <el-button class="mt-8" disabled>
              Request Access
            </el-button>
          </template>
        </sparc-tooltip>
      </div>
    </div>
    <div v-else-if="embargoed && requestPending">
      Your access request is pending. The author has received your
      request and an email confirming or denying your request will
      be sent to you once the author has made a decision. The embargoed
      release date for this dataset is <b>{{ embargoedReleaseDate }}</b>
      and will become available to the public on that day.
      <div>
        <sparc-tooltip content="Access request is pending" placement="top-center">
          <template #item>
            <el-button class="mt-8" disabled>
              Request Access
            </el-button>
          </template>
        </sparc-tooltip>
      </div>
    </div>
    <div v-else-if="embargoed && !accessGranted">
      This dataset is currently <a href="https://docs.sparc.science/docs/embargoed-data" target="_blank">embargoed</a>.
      SPARC datasets are subject to a 1-year
      embargo during which time the datasets
      are visible only to members of the
      SPARC consortium. During embargo, the
      public will be able to view basic
      metadata about these datasets as well
      as their release date. The embargoed release
      date for this dataset is <b>{{ embargoedReleaseDate }}</b>
      and will become available to the public on that day.
      Click 'Request Access' to request permission from
      the author to view the embargoed data.
      <div>
        <el-button class="my-8" :disabled="embargoAccess != null && agreementId != null" @click="openAgreementPopup()">
          Request Access
        </el-button>
      </div>
    </div>
    <div v-else>
      <div class="mb-8">
        <span class="label4">Dataset size: </span>{{ formatMetric(datasetInfo.size) }}
      </div>
      <el-row class="bx--row">
        <el-col :md="12" class="bx--col-sm-4 bx--col-md-8 bx--col left-column">
          <div v-if="!isDatasetSizeLarge">
            <div><span class="label4">Option 1 - Direct download: </span>Download a zip archive of all the files and
              metadata directly to your computer free of charge. Please note that the files will be compressed upon
              download.</div>
            <a :href="downloadUrl">
              <el-button class="my-16">Download Full Dataset</el-button>
            </a>
          </div>
          <div v-else>
            <div><span class="label4">Option 1 - Direct download: </span>Direct downloads are only available free of
              charge for datasets that are 5GB or smaller. Datasets bigger than 5GB will need to be downloaded via AWS.
            </div>
            <sparc-tooltip placement="left-center">
              <template #data>
                <div>
                  Dataset size is over 5GB. To download, use <b>Option 2 - AWS download</b>
                </div>
              </template>
              <template #item>
                <el-button disabled class="my-16">Download Full Dataset</el-button>
              </template>
            </sparc-tooltip>
          </div>
        </el-col>
        <el-col :md="12" class="bx--col-sm-4 bx--col-md-8 bx--col aws-download-column">
          <div class="mb-8">
            <span class="label4">Option 2 - AWS download: </span>
            Download or transfer the dataset to your AWS Account. The files and metadata are stored in an AWS S3
            Requester Pays bucket. You can learn more about downloading data from AWS on our
            <a href="https://docs.pennsieve.io/docs/copy-a-public-dataset-to-your-own-aws-account" target="_blank">Help Page</a>.
          </div>
          <div class="aws-block mb-16 px-16 pb-16 pt-8">
            <template v-if="isLatestVersion">
              <div class="heading3">Resource Type</div>
              <div class="mb-0"><span class="heading3">Amazon S3 Bucket</span> (Requester Pays) *</div>
              <div class="download-text-block mb-8 p-4">
                {{ datasetArn }}
                <button class="copy-button" @click="handleCitationCopy(datasetArn)">
                  <img src="../../static/images/copyIcon.png" />
                </button>
              </div>
              <div class="heading3 mb-0">AWS Region</div>
              <div class="download-text-block p-4 aws">
                {{ awsMessage}}
                <button class="copy-button" @click="handleCitationCopy(awsMessage)">
                  <img src="../../static/images/copyIcon.png" />
                </button>
              </div>
            </template>
            <template v-else>
              <div class="label4">
                Requesting Access from AWS
              </div>
              <p>
                Access to older versions of the dataset on AWS is no longer readily available. 
                To obtain access to previous versions directly from your AWS account, click "Request Access" below. 
                More information is available in the <a href="https://docs.sparc.science/docs/accessing-public-datasets" target="_blank">SPARC Help Center</a>.
              </p>
              <el-button :style="'display: flex; margin: auto'" @click="showRehydrationModal = true">
                Request Access
              </el-button>
            </template>
          </div>
          <div>
            * Requester Pays means that any costs associated with downloading the data will be charged to your AWS
            account.
            For transfer pricing information, visit the <a href="https://aws.amazon.com/s3/pricing/" target="blank">AWS
              Pricing documentation.</a>
          </div>
        </el-col>
      </el-row>
      <hr />
      <h2 class="heading2">
        Dataset Files
      </h2>
      <div class="flex mb-16">
        <span>
          <span class="label4">Dataset size: </span>{{ formatMetric(datasetInfo.size) }}
        </span>
        <span class="dataset-link inline">
          <a href="https://docs.sparc.science/docs/navigating-a-sparc-dataset" class="dataset-link" target="_blank">
            How to navigate datasets
          </a>
        </span>
      </div>
      <files-table :dataset-scicrunch="datasetScicrunch" />
    </div>
    <data-use-agreement-popup :show-dialog="showAgreementPopup" @agreement-loaded="agreementLoaded"
      @dialog-closed="showAgreementPopup = false" @agreement-signed="requestAccess" />
    <rehydration-modal v-model="showRehydrationModal" append-to-body
      @close-rehydration-dialog="showRehydrationModal = false" :version="versionId" :dataset-id="datasetId" />
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useMainStore } from '../../store'
import { propOr } from 'ramda'

import DataUseAgreementPopup from '@/components/DataUseAgreementPopup/DataUseAgreementPopup.vue'
import FilesTable from '@/components/FilesTable/FilesTable.vue'
import FormatMetric from '@/mixins/bf-storage-metrics'
import DateUtils from '@/mixins/format-date'
import { EMBARGO_ACCESS } from '@/utils/constants'
import { successMessage, failMessage } from '@/utils/notification-messages'

export default {
  name: 'DatasetFilesInfo',

  components: {
    DataUseAgreementPopup,
    FilesTable
  },

  mixins: [DateUtils, FormatMetric],

  computed: {
    /**
     * Get dataset info from the store
     * @returns {Object}
     */
    ...mapState(useMainStore, ['datasetInfo', 'userToken']),
    datasetScicrunch() {
      return propOr({}, 'sciCrunch', this.datasetInfo)
    },
    accessGranted: function() {
      return this.embargoAccess == EMBARGO_ACCESS.GRANTED
    },
    requestPending: function() {
      return this.embargoAccess == EMBARGO_ACCESS.REQUESTED
    },
    embargoed: function() {
      return propOr(false, 'embargo', this.datasetInfo)
    },
    embargoAccess() {
      return propOr(null, 'embargoAccess', this.datasetInfo)
    },
    embargoedReleaseDate() {
      const embargoPublishDate = this.formatDate(propOr('', 'firstPublishedAt', this.datasetInfo))
      const embargoReleaseDate = this.formatDate(propOr('', 'embargoReleaseDate', this.datasetInfo))
      return embargoReleaseDate != '' ? embargoReleaseDate : `1 year after ${embargoPublishDate}`
    },
    /**
     * Checks whether the dataset download size is larger or smaller than 5GB
     * @returns {Boolean}
     */
    isDatasetSizeLarge: function() {
      const datasetSize = propOr(0, 'size', this.datasetInfo)
      return datasetSize > this.$config.public.max_download_size
    },
    /**
     * Gets dataset ARN
     * @returns {String}
     */
    datasetArn: function() {
      return propOr('', 'uri', this.datasetInfo)
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
    },
    isLatestVersion() {
      return this.versionId == this.datasetInfo.latestVersion
    },
    /**
     * Computes the API url for downloading a dataset
     * @returns {String}
     */
    downloadUrl: function() {
      var url = `${this.$config.public.discover_api_host}/datasets/${this.datasetId}/versions/${this.versionId}/download?downloadOrigin=SPARC`
      if (this.userToken) {
        url += `&api_key=${this.userToken}`
      }
      return url
    }
  },

  data() {
    return {
      awsMessage: 'us-east-1',
      showAgreementPopup: false,
      showRehydrationModal: false,
      agreementId: null
    }
  },

  methods: {
    ...mapActions(useMainStore, ['setDatasetInfo']),
    /**
     * Handle copy citation to clipboard
     */
    handleCitationCopy: function(text) {
      navigator.clipboard.writeText(text).then(() => {
        successMessage(
          "Copied to clipboard."
        )
      }),
        () => {
          failMessage('Failed to copy.')
        }
    },
    agreementLoaded(id) {
      this.agreementId = id
    },
    openAgreementPopup: function() {
      this.showAgreementPopup = true
    },
    requestAccess() {
      const url = `${this.$config.public.discover_api_host}/datasets/${this.datasetInfo.id}/preview`

      this.$pennsieveApiClient.value
        .post(url, {
          dataUseAgreementId: this.agreementId,
        })
        .then(() => {
          this.updateEmbargoAccess(EMBARGO_ACCESS.REQUESTED)

          successMessage('Your request has been successfully submitted.')
        })
        .catch((error) => {
          failMessage('Unable to submit request at this time.')
          throw error
        })
    },
    updateEmbargoAccess(access) {
      const newDatasetInfo = {
        ...this.datasetInfo,
        embargoAccess: access
      }

      this.setDatasetInfo(newDatasetInfo)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
a {
  text-decoration: underline;
}
hr {
  margin-top: 1rem;
  border-top: none;
}
.bx--row {
  margin: 0;
}
[class*="bx--col"] {
  padding: 0;
  @media (min-width: 62em) {
    padding: 1em;
  }
}
.left-column {
  padding-left: 0;
}
.aws-download-column {
  @media (min-width: 64rem) {
    border-left: 1px solid $lineColor1
  }
}
.flex {
  display: flex;
  align-content: space-between;
}

.inline {
  margin-left: auto;
  display: inline-block;
}

.download-text-block {
  background-color: $background;
  display: flex;
  justify-content: space-between;
  border-radius: 4px;
}
.copy-button {
  border: none;
  background: transparent;
  cursor: pointer;
  img {
    width: 20px;
    height: 20px;
  }
}
.aws-block {
  border: 1px solid $lineColor1;
}
</style>
