<script setup>

import {compose, head, propOr} from "ramda";

import BfButton from '~/components/Shared/BfButton/BfButton.vue'


const runtimeConfig = useRuntimeConfig()

const emit = defineEmits(['close-download-dialog','open-hydration-dialog']);


const props = defineProps({
  visible: {
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
})

/**
 * Checks whether the dataset download size is larger or smaller than 1GB
 * @returns {Boolean}
 */
const isDatasetSizeLarge = computed(() => {
  const datasetSize = propOr(0, 'size', props.datasetDetails)
  return datasetSize > runtimeConfig.public.max_download_size
})

/**
 * Compute width based on isDatasetSizeLarge
 * @returns {String}
 */
const width = computed(() => {
  return isDatasetSizeLarge.value ? '490px' : '772px'
})

/**
 * Gets dataset id
 * @returns {Number}
 *
 */
const datasetId = computed(() => {
  return propOr(0, 'id', props.datasetDetails)
})

/**
 * Gets dataset version
 * @returns {Number}
 */
const version = computed(() => {
  return propOr(0, 'version', props.datasetDetails)
})

/**
 * Gets dataset ARN
 * @returns {String}
 */
const datasetArn = computed(() => {
  return propOr('', 'uri', props.datasetDetails)
})


/**
 * Indicates whether the version being viewed is the latest version
 * @returns {Boolean}
 */
const isLatestVersion = computed(() => {
  const latestVersion = compose(propOr(1, 'version'), head)(props.versions)
  return version.value === latestVersion
})


/**
 * Computes the API url for downloading a dataset
 * @returns {String}
 */

function downloadDataset(event) {
  try {
  event.preventDefault();
  const url = `${runtimeConfig.public.discover_api_host}/datasets/${datasetId.value}/versions/${version.value}/download?downloadOrigin=Discover`;
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
    
  } catch (err) {
    console.error("Download failed:", err);
  }
}


/**
 * Closes dialog
 */
function closeDialog() {
  emit('close-download-dialog')
}

/**
 * Opens the version history modal
 */
function openRehydrationModal() {

  emit('close-download-dialog')
  emit('open-hydration-dialog')

}

</script>

<!--
   There are two boolean values that control different versions of this modal.
   1. isDatasetSizeLarge
   2. isLatestVersion
   Test all four permutations when making changes.

   Only show Request Rehydration button when isLatestVersion is false.
 -->

<template>
  <div>
    <el-dialog
      :modelValue="visible"
      :show-close="false"
      class="download-dataset-dialog"
      :width="width"
      height="448px"
      @close="closeDialog"
    >
      <div class="download-dataset-container">
        <div v-if="!isDatasetSizeLarge" class="download-block">
          <h1>Direct Download</h1>
          <p>
            You can download the raw files and metadata directly to your
            computer as a zip archive.
          </p>
          <bf-button @click="downloadDataset" class="download-button">Download Dataset</bf-button>

          <div class="size">
            {{ useFormatMetric(props.datasetDetails.size) }}
          </div>
          <img
            class="download-illo"
            src="../../../assets/images/illustrations/illo-data-management.svg"
            alt="illustration of data management"
          />
        </div>
        <div
          v-if="!isLatestVersion"
          :class="[isDatasetSizeLarge ? 'aws-container' : 'aws-block']"
        >
          <button class="close-dialog-button" @click="closeDialog">
            <IconRemove
              :width="16"
              :height="16"
              class="close-icon"
            />
          </button>
          <h1>Requesting Access to Download from AWS</h1>
          <p>
            Access to older versions of datasets are no longer available on AWS.
            To obtain access to download this dataset, please Request Access to
            fill our a form. More information is available on the
            <a
              href="https://docs.pennsieve.io/docs/requesting-rehydration-of-a-public-dataset"
              >Pennsieve Documentation Hub</a
            >.
          </p>
          <div class="rehydrate-dataset-container" v-if="!isLatestVersion">
            <div class="rehydration-btn-container">
              <bf-button
                v-if="!isLatestVersion"
                key="btn-request-rehydration"
                class="rehydration-btn"
                @click="openRehydrationModal"
              >
                Request Access
              </bf-button>
            </div>
          </div>
        </div>

        <div
          v-if="isLatestVersion"
          :class="[isDatasetSizeLarge ? 'aws-container' : 'aws-block']"
        >
          <button class="close-dialog-button" @click="closeDialog">
            <IconRemove
              :width="16"
              :height="16"
              class="close-icon"
            />
          </button>
          <h1>Download from AWS</h1>
          <p>
            Raw files and metadata are stored in an AWS S3 Requester Pays
            bucket. You can learn more about
            <a
              href="https://docs.pennsieve.io/docs/downloading-a-public-dataset"
              target="_blank"
            >
              downloading data from AWS
            </a>
            in the Help Center.
          </p>
          <h2>Resource Type</h2>
          <p>Amazon S3 Bucket (Requester Pays)</p>
          <h2>Amazon S3 Bucket</h2>
          <div class="text-block">
            {{ datasetArn }}
          </div>
          <h2>AWS Region</h2>
          <div class="text-block">
            us-east-1
          </div>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/variables';

.download-dataset-dialog {
  .download-dataset-container {
    display: flex;
    word-break: normal;
  }
  .download-block {
    box-sizing: border-box;
    flex-shrink: 0;
    width: 316px;
    overflow: hidden;
    position: relative;
    background-color: variables.$purple_2;
    padding: 40px 40px 0px 40px;
    min-height: 378px;

    img {
      position: absolute;
      top: 245px;
      left: -102px;
      opacity: 0.3;
      width: 413px;
      height: 402px;
    }

    h1 {
      line-height: 32px;
      color: #ffffff;
      font-size: 24px;
      font-weight: 500;
      margin: 0;
    }

    p {
      line-height: 24px;
      color: #cddaff;
      font-size: 16px;
      margin-top: 8px;
    }

    .size {
      text-align: center;
      line-height: 24px;
      color: #ffffff;
      font-size: 14px;
      margin-top: 2px;
    }

    .download-button {
      cursor: pointer;
      height: 60px;
      width: 236px;
      border-radius: 3px;
      background-color: variables.$purple_3;
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      margin-top: 5px;
    }
  }

  a {
    text-decoration: none;
    &:hover {
      text-decoration: none;
    }

    &:focus {
      color: variables.$orange_1;
    }
  }

  .aws-container {
    margin: 47px 48px 21px;
  }

  .rehydrate-dataset-container {
    margin: 47px 48px 21px;
  }

  .close-dialog-button {
    float: right;
    margin-top: -21px;
    background: none;
    border: none;
    outline: none;
    padding: 0;
    cursor: pointer;
  }

  .close-icon {
    margin-top: 26px;
    margin-right: -12px;
  }

  h1 {
    color: #000000;
    font-size: 24px;
    font-weight: 500;
    line-height: 32px;
    margin-bottom: 8px;
  }

  p {
    color: #000000;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 16px;
  }

  h2 {
    color: #000000;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px;
  }

  .text-block {
    font-family: Courier,serif;
    border-radius: 2px;
    background-color: #f1f1f3;
    padding: 8px 8px 8px 8px;
    margin-bottom: 16px;
    font-size: 14px;
    display: flex;
    align-items: center;
  }

  .aws-block {
    box-sizing: border-box;
    padding: 40px 40px 0;
  }

  .download-illo {
    pointer-events: none;
  }


}
.rehydration-btn-container {
  display: flex;
  justify-content: center;
}
.rehydration-btn {
  margin-bottom: 25px;
  font-weight: 600;
  line-height: 16px;
  font-size: 14px;
}

.copy-container {
  margin: 10px;
  display: flex;
  justify-content: center;
}
</style>

<style lang="scss">
.download-dataset-dialog.el-dialog {
  border-radius: 0;
  padding:0;
  
  .el-dialog__header {
    padding: 0 !important; // Remove important after removing the sparc stylesheets dependency
  }

  .el-dialog__body {
    padding: 0;
  }

}
</style>
