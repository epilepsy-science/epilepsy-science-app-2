<script setup>


import {compose, head, last, propOr, split} from 'ramda'

// import EventBus from '@/utils/event-bus'
import {getLicenseAbbr, getLicenseLink} from '~/utils/license-util.js'
import {EMBARGO_ACCESS} from '~/utils/constants.js'

import {computed} from "vue";

const runtimeConfig = useRuntimeConfig()

const emit = defineEmits(['update-embargo-access']);


const props = defineProps({
  datasetDetails: {
    type: Object,
    default: () => {}
  },
  versions: {
    type: Array,
    default: () => []
  },
  lastUpdatedDate: {
    type: String,
    default: ''
  },
  datasetDescription: {
    type: String,
    default: ''
  },
  isDatasetEmbargoed: {
    type: Boolean,
    default: false
  },
  hasAgreement: {
    type: Boolean,
    default: false
  },
  dataUseAgreement: {
    type: Object,
    default: () => {}
  }
})

const isDownloadModalVisible = ref(false)
const isVersionModalVisible = ref(false)
const isContributorListVisible = ref(true)
const isSigningAgreement = ref(false)
const isDataUseAgreementSignDialogVisible = ref(false)


/**
 * Compute if the get dataset button should be visible
 * based on if the dataset is embargoed, and the user's
 * access to the dataset
 * @returns {Boolean}
 */
const isGetDatasetBtnVisible = computed(() => {
  return props.isDatasetEmbargoed
    ? props.datasetDetails.embargoAccess === EMBARGO_ACCESS.GRANTED
    : true
})

/**
 * Compute if the get dataset button is disabled
 * Public datasets, users who are logged in and non-logged-in users
 * should be able to download datasets as a zip up to 5GB. and see
 * the S3 info otherwise
 * Embargoed datasets. Only users who are logged in and have access
 * to the dataset should be able to download the dataset.
 * @returns {Boolean}
 */
const isGetDatasetBtnDisabled = computed(() => {
  return props.isDatasetEmbargoed
})

const datasetContributorsList = computed(() => {
  return isContributorListVisible.value
    ? datasetContributors.value
    : [last(datasetContributors.value)]
})

/**
 * Gets dataset size for download
 * @returns {Number}
 */
const getDownloadSize = computed(() => {
  return propOr(0, 'size', props.datasetDetails)
})



/**
 * Gets dataset ID
 * @returns {Number}
 */
const datasetId = computed(() => {
  return propOr(0, 'id', props.datasetDetails)
})

/**
 * Gets latest version number of dataset
 * @returns {Number}
 */
const latestVersion = computed(() => {
  return propOr(1, 'version', props.datasetDetails)
})

/**
 * dataset revision property
 * @returns {Number | null}
 */
const revision = computed(() => {
  return propOr(null, 'revision', props.datasetDetails)
})

/**
 * computes the right text based on the version and revision
 * @returns {String}
 */
const versionRevisionText = computed(() => {
  const versionText = `Version ${latestVersion.value}`
  const revisionText = revision.value ? `, Revision ${revision.value}` : ''
  return versionText + revisionText
})

/**
 * Gets license link
 * @returns {String}
 */
const licenseLink = computed(() => {
  return getLicenseLink(datasetLicense.value)
})

/**
 * Returns the dataset title
 * @returns {String}
 */
const datasetTitle = computed(() => {
  return propOr('', 'name', props.datasetDetails)
})

/**
 * Checks if a banner image exists or not
 * @returns {Boolean}
 */
const datasetImage = computed(() => {
  const banner = propOr('', 'banner', props.datasetDetails)
  if (!banner.includes('banner.jpg') || banner === '') {
    return true
  }
  return false
})

/**
 * Returns dataset banner
 * @returns {String}
 */
const getDatasetImage = computed(() => {
  return propOr('', 'banner', props.datasetDetails)
})

/**
 * Returns the files associated with the dataset
 * @returns {String}
 */
const datasetFiles = computed(() => {
  return propOr('', 'fileCount', props.datasetDetails)
})

/**
 * Returns the dataset storage count
 * @returns {Object}
 */
const datasetStorage = computed(() => {
  const storage = compose(
    split(' '),
    useFormatMetric,
    propOr(0, 'size')
  )(props.datasetDetails)

  return storage.reduce((number, unit) => {
    return {
      number,
      unit
    }
  })
})

/**
 * Returns the dataset record count
 * @returns {String}
 */
const datasetRecords = computed(() => {
  return propOr('', 'recordCount', props.datasetDetails)
})

/**
 * Returns the license abbr associated with the dataset
 * @returns {String}
 */
const datasetLicense = computed(() => {
  const licenseKey = propOr('', 'license', props.datasetDetails)
  return getLicenseAbbr(licenseKey)
})


const datasetLicenseName = computed(() => {
  return propOr('', 'license', props.datasetDetails)
})


/**
 * Returns the list of contributors who contributed to the dataset
 * @returns {String}
 */
const datasetContributors = computed(() => {
  return propOr([], 'contributors', props.datasetDetails)
})

/**
 * Gets the first contributor from the list
 * @returns {String}
 */
const firstContributor = computed(() => {
  return head(datasetContributors.value)
})

/**
 * Gets the last contributor from the list
 * @returns {String}
 */
const lastContributor = computed(() => {
  return last(datasetContributors.value)
})

/**
 * Compute dataset owner
 * @returns {String}
 */
const datasetOwner = computed(() => {
  return propOr('', 'ownerName', props.datasetDetails)
})

/**
 * Return corresponding contributor details
 * @returns {Object}
 */
const correspondingContributor = computed(() => {
  const firstName = propOr('', 'ownerFirstName', props.datasetDetails)
  const lastName = propOr('', 'ownerLastName', props.datasetDetails)
  const orcid = propOr('', 'ownerOrcid', props.datasetDetails)
  return {
    firstName,
    lastName,
    orcid
  }
})

onMounted((to, from) => {
  // EventBus.$on('close-version-dialog', closeVersionModal)
  /**
   * Sets the contributors list to collapsed
   * if there are more than five contributors
   */
  isContributorListVisible.value = datasetContributors.value.length < 25
})

/**
 * Formats the number to include commas
 * @param {String} number
 */
function formatNumber(number) {
  return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

/**
 * Opens the Get Dataset modal
 */
function getDataset() {
  isDownloadModalVisible.value = true
}

/**
 * Opens the version history modal
 */
function getVersionHistory() {
  isVersionModalVisible.value = true
}

/**
 * Closes the version history modal
 */
function closeVersionModal() {
  isVersionModalVisible.value = false
}

/**
 * If has agreement, open dialog and prompt user to sign
 * Otherwise, request access
 */
function onRequestAccessClick() {
  if (props.hasAgreement.value) {
    isSigningAgreement.value = true
    isDataUseAgreementSignDialogVisible.value = true
  } else {
    requestAccess()
  }
}


// TODO: Uncomment this function when the login setup is ready
/**
 * Opens Data Use Agreement Modal
 * @param {Number} dataUseAgreementId
 */
// async function requestAccess(dataUseAgreementId) {

//   const url = `${runtimeConfig.public.discover_api_host}/datasets/${props.datasetDetails.id}/preview?api_key=${await useGetToken()}`

//   useSendXhr(url,{
//     header: {},
//     method: 'POST',
//     body: {
//       datasetId: props.datasetDetails.id,
//       dataUseAgreementId
//     }
//   }).then(() => {
//     isDataUseAgreementSignDialogVisible.value = false
//     isSigningAgreement.value = false
//     emit('update-embargo-access', EMBARGO_ACCESS.REQUESTED)

//     EventBus.$emit('toast', {
//       detail: {
//         msg: `Your request has been successfully submitted.`,
//         type: 'success',
//         class: 'request-submitted'
//       }
//     })
//   }).catch((error) => {
//     throw error
//   })

// }

/**
 * Download the agreement
 */
function downloadAgreement() {
  const url = `${runtimeConfig.public.discover_api_host}/datasets/${props.datasetDetails.id}/data-use-agreement/download`
  isDataUseAgreementSignDialogVisible.value = false
  isSigningAgreement.value = false

  const downloadEl = document.createElement('a')
  downloadEl.setAttribute('href', url)
  downloadEl.setAttribute('download', 'download')

  if (document.createEvent) {
    const event = document.createEvent('MouseEvents')
    event.initEvent('click', true, true)
    downloadEl.dispatchEvent(event)
  } else {
    downloadEl.click()
  }
}

const isRehydrationModalVisible = ref(false)



</script>


<template>
  <div class="dataset-header">
    <div class="row mb-8">
      <div class="col-xs-12">
        <NuxtLink :to="{ name: 'data' }" class="header-link">
          <IconArrowLeft class="header-link-icon"/>
          View all Datasets
        </NuxtLink>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12 col-sm-6">
        <h1 class="dataset-title">
          {{ datasetTitle }}
        </h1>

        <div class="dataset-owners">
          <template v-if="!isContributorListVisible">
            <contributor-item :contributor="firstContributor" />
            <button
              class="contributors-button"
              href="#"
              @click.prevent="isContributorListVisible = true"
            >
              <span class="button-text">...</span>
            </button>
          </template>

          <div
            v-for="(contributor, idx) in datasetContributorsList"
            :key="contributor.id"
            class="contributor-item-wrap"
          >
            <contributor-item :contributor="contributor" />
            <template v-if="idx < datasetContributorsList.length - 1">
              ,
            </template>
          </div>
        </div>

        <p class="dataset-description">
          {{ datasetDescription }}
        </p>
        <div class="dataset-meta">
          <div class="dataset-updated-date">
            Updated on {{ lastUpdatedDate }} (<a
              href="#"
              @click.prevent="getVersionHistory"
              >{{ versionRevisionText }}</a
            >)
          </div>
          <div class="dataset-corresponding-contributor">
            <p>Corresponding Contributor:</p>
            <contributor-item :contributor="correspondingContributor" />
            
          </div>
        </div>
        <bf-button
          v-if="isGetDatasetBtnVisible"
          key="btn-get-dataset"
          :disabled="isGetDatasetBtnDisabled"
          class="get-dataset-button"
          @click="getDataset"
        >
          Get Dataset
        </bf-button>
        <bf-button
          v-if="isDatasetEmbargoed && datasetDetails.embargoAccess === null"
          key="btn-request-access"
          class="get-dataset-button"
          @click="onRequestAccessClick"
        >
          <IconLock/>
          Request Access
        </bf-button>

        <p
          v-if="
            isDatasetEmbargoed &&
              datasetDetails.embargoAccess === EMBARGO_ACCESS.REQUESTED
          "
          key="request-access-pending"
          class="requested-label"
        >
          Your request for access is pending.
        </p>
      </div>
      <div class="col-xs-12 col-sm-6 first-xs last-sm">
        <div class="header-image-section">
          <dataset-banner-image class="dataset-image" :src="getDatasetImage" />
        </div>
      </div>
    </div>

    <div class="header-stats-section">
      <div class="row">
        <div class="col-xs-6 col-sm-3">
          <div class="header-stats-block">
            <IconFiles class="mr-8" :height="20" :width="20"/>
            <div>
              <template v-if="datasetFiles > 0">
                <strong>{{ formatNumber(datasetFiles) }}</strong> Files
              </template>

              <template v-else>
                No Files
              </template>
            </div>
          </div>
        </div>
        <div class="col-xs-6 col-sm-3">
          <div class="header-stats-block">
            <IconStorage class="mr-8" :height="20" :width="20"/>
            <div>
              <strong>{{ datasetStorage.number }}</strong>
              {{ datasetStorage.unit }}
            </div>
          </div>
        </div>
        <div class="col-xs-6 col-sm-3">
          <div class="header-stats-block">
            <IconDocument class="mr-8" :height="20" :width="20"/>

            <div>
              <template v-if="datasetRecords > 0">
                <strong>{{ formatNumber(datasetRecords) }}</strong> Records
              </template>

              <template v-else>
                No Records
              </template>
            </div>
          </div>
        </div>
        <div class="col-xs-6 col-sm-3">
          <div class="header-stats-block">
            <IconLicense class="mr-8" :height="20" :width="20"/>
            <div>
              <template v-if="datasetLicense">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="datasetLicenseName"
                  placement="top"
                  :visible-arrow="false"
                >
                  <a :href="licenseLink" target="_blank">
                    {{ datasetLicense }}
                  </a>
                </el-tooltip>
              </template>

              <template v-else>
                No License Selected
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <download-dataset
      v-model:visible="isDownloadModalVisible"
      :dataset-details="datasetDetails"
      :versions="versions"
      :download-size="getDownloadSize"
      @close-download-dialog="isDownloadModalVisible = false"
      @open-hydration-dialog="isRehydrationModalVisible = true"
    />

    <rehydration-modal
      v-model:visible="isRehydrationModalVisible"
      :version="props.datasetDetails.version"
      :dataset-id="props.datasetDetails.id"
      @close-rehydration-dialog="isRehydrationModalVisible = false"
    />

    <version-history
      v-model:visible="isVersionModalVisible"
      :dataset-id="props.datasetId"
      :latest-version="props.latestVersion"
      :versions="props.versions"
      @close-version-dialog="closeVersionModal"
    />

<!--    <data-use-agreement-sign-dialog-->
<!--      :visible.sync="isDataUseAgreementSignDialogVisible"-->
<!--      :data-use-agreement="dataUseAgreement"-->
<!--      :is-signing-agreement.sync="isSigningAgreement"-->
<!--      @submit="requestAccess"-->
<!--      @download="downloadAgreement"-->
<!--    />-->
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/variables';


.header-image-section {
  .dataset-image {
    display: block;
    height: auto;
    width: 100%;
    @media (max-width: 48em) {
      max-width: 400px;
    }
    @media (min-width: 48em) {
      width: 100%;
    }
  }
}

.header-stats-section {
  border-top: 1px solid #dadada;
  border-bottom: 1px solid #dadada;
  margin: 26px 0 10px;
  padding: 10px 16px;
}

.header-stats-block {
  align-items: center;
  display: flex;
  a {
    &:focus {
      color: #1c46bd;
    }
  }
}

.dataset-header {
  padding-top: 24px;
  h1 {
    font-size: 32px;
    color: #000;
    font-weight: bold;
    margin-bottom: 24px;
    line-height: 40px;
    word-break: break-word;
    @media (min-width: 48em) {
      margin-top: 32px;
    }
  }
}
.dataset-description {
  color: #000;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 24px;
}

.dataset-owners {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  color: #404554;
  font-size: 14px;
  line-height: 24px;
  margin-bottom: 13px;
  .contributor-item-wrap {
    display: inline-flex;
    margin-right: 4px;
  }
}

.dataset-corresponding-contributor {
  display: inline-flex;
  flex-direction: row;

  p {
    margin-right: 3px;
  }
}

.dataset-updated-date {
  height: 24px;
  color: #404554;
  font-size: 14px;
  line-height: 24px;

  a {
    color: #404554;
    text-decoration: underline;
    &:hover,
    &:active,
    &:visited {
      color: #404554;
    }
    &:focus {
      color: black;
    }
  }
}

.get-dataset-button {
  font-weight: 600;
  line-height: 16px;
  font-size: 14px;
  background-color: variables.$purple_3;
  margin-top: 19px;

  &:focus {
    background-color: variables.$purple_3;
  }
  .svg-icon {
    margin-right: 8px;
  }
}
.header-link {
  color: variables.$purple_2;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;

  &:focus {
    color: variables.$purple_2;
  }

  .header-link-icon {
    color: variables.$purple_2;
    height: 10px;
    width: 10px;
    margin-right: 4px;
  }
}

.contributors-button {
  height: 16px;
  width: 16px;
  border-radius: 2px;
  background-color: #dadada;
  margin: 0 6px;

  &:focus {
    background-color: #b6b7ba;
  }

  .button-text {
    position: relative;
    bottom: 5px;
  }
}
.requested-label {
  font-size: 16px;
  font-weight: 700;
  margin-top: 32px;
}
</style>
