<script setup>


import IconFiles from "~/components/Icons/IconFiles.vue";
import IconStorage from "~/components/Icons/IconStorage.vue";
import IconDocument from "~/components/Icons/IconDocument.vue";
import IconLicense from "~/components/Icons/IconLicense.vue";

import {propOr, take} from "ramda";
import DatasetBannerImage from "~/components/Dataset/DatasetBannerImage/DatasetBannerImage.vue";

const props = defineProps({
  dataset: {
    type: Object,
    default: () => {
      return {
        arn: '',
        banner: '',
        contributors: [],
        createdAt: '',
        description: '',
        doi: '',
        type: '',
        embargo: false,
        embargoReleaseDate: null,
        fileCount: null,
        firstPublishedAt: '',
        id: null,
        license: '',
        modelCount: [],
        name: '',
        organizationName: '',
        ownerFirstName: '',
        ownerLastName: '',
        ownerOrcid: '',
        readme: '',
        recordCount: null,
        revisedAt: '',
        size: null,
        status: '',
        sponsorship:'',
        tags: [],
        updatedAt: '',
        uri: '',
        version: null,
        versionPublishedAt: ''
      }
    }
  }
})

/** Formats the embargoed release date
 * @returns {String}
 */
const getEmbargoReleaseDate = computed(() => {
  return useFormatDate(props.dataset.embargoReleaseDate)
})
/**
 * Compute sponsor status for dataset
 * @returns {boolean}
 */
const hasSponsor = computed(() => {
  return !!props.dataset.sponsorship
})

/**
 * Compute first three tags
 * @returns {Array}
 */
const firstThreeTags = computed(() => {
  const tags = propOr([], 'tags', props.dataset)
  return take(3, tags)
})

/**
 * Compute abbreviation for license
 * @returns {String}
 */
const licenseAbbreviation = computed(() => {
  const license = propOr('', 'license', props.dataset)
  return getLicenseAbbr(license)
})

/**
 * Compute the dataset owner's name
 * @returns {String}
 */
const datasetOwnerName = computed(() => {
  const firstName = propOr('', 'ownerFirstName', props.dataset)
  const lastName = propOr('', 'ownerLastName', props.dataset)
  return `${firstName} ${lastName}`
})

/**
 * Get formatted last updated date
 * @return {String}
 */
const lastUpdatedDate = computed(() => {
  const date = props.dataset.revisedAt || props.dataset.versionPublishedAt
  return useFormatDate(date)
})

function formatNumber(number) {
  return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

</script>

<template>
  <div class="dataset-card">
    <div class="dataset-content">
      <div class="image mr-16">
        <dataset-banner-image :src="dataset.banner" />
      </div>
      <div class="dataset-content-wrap">
        <h3>
          <NuxtLink :to="{ name: 'datasets-datasetId', params: { datasetId: dataset.id }}">
            {{ dataset.name }}
          </NuxtLink>
        </h3>
        <div class="subtitle">
          {{ dataset.description }}
        </div>
        <div class="dataset-details-wrap mt-16">
          <div class="details">
            <div class="detail">
              <icon-files :height="16" :width="16"/>
              <span v-if="dataset.fileCount > 0 && dataset.fileCount !== 1">
                <strong>{{ formatNumber(dataset.fileCount) }}</strong> Files
              </span>
              <span v-else-if="dataset.fileCount === 1">
                <strong>{{ dataset.fileCount }}</strong> File
              </span>
              <span v-else>No Files</span>
            </div>
            <div class="detail">
              <icon-storage :height="16" :width="16"/>
              <strong>{{ useFormatMetric(dataset.size) }}</strong>
            </div>
            <div class="detail">
              <icon-document :height="16" :width="16"/>
              <span v-if="dataset.recordCount > 0 && dataset.recordCount !== 1">
                <strong>{{ formatNumber(dataset.recordCount) }}</strong> Records
              </span>
              <span v-else-if="dataset.recordCount === 1">
                <strong>{{ dataset.recordCount }}</strong> Record
              </span>
              <span v-else>No Records</span>
            </div>
            <div class="detail">
              <icon-license :height="16" :width="16"/>
              <span v-if="dataset.license === ''">No License</span>
              <el-tooltip
                v-else
                class="item"
                effect="dark"
                :content="dataset.license"
                placement="top"
                :visible-arrow="false"
              >
                <span>{{ licenseAbbreviation }}</span>
              </el-tooltip>
            </div>
          </div>
          <div v-if="hasSponsor" class="dataset-sponsor">
            <h4>Sponsored{{ dataset.sponsorship.title ? ' by' : '' }}</h4>
            <p>{{ dataset.sponsorship.title }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="meta">
      <div v-if="!dataset.embargo" class="author">
        <strong>{{ datasetOwnerName }}</strong>
        updated on {{ lastUpdatedDate }}
      </div>
      <div v-else class="author">
        <strong>Dataset will be released on</strong> {{ getEmbargoReleaseDate }}
      </div>
      <div v-if="dataset.tags.length > 3" class="tags">
        <strong>{{ firstThreeTags.join(', ') }}</strong>
<!--        <nuxt-link-->
<!--          :to="{-->
<!--            name: 'datasets-id',-->
<!--            params: {-->
<!--              id: dataset.id-->
<!--            }-->
<!--          }"-->
<!--        >-->
          +{{ firstThreeTags.count }}
          More
<!--        </nuxt-link>-->
      </div>
      <div v-else class="tags">
        <strong>{{ dataset.tags.join(', ') }}</strong>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.dataset-card {
  border: solid 1px $cortex;
  border-radius: 3px 3px 0 0;

}

.dataset-content-wrap {
  flex: 1;
}
h3 {
  color: #2760ff;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0 0 8px;
  word-break: break-word;
}

.subtitle {
  color: #000;
  font-size: 14px;
  font-weight: normal;
  line-height: 24px;
  margin-bottom: 16px;
}
.dataset-details-wrap {
  display: flex;
  flex-direction: column;
  @media (min-width: 992px) {
    align-items: flex-end;
    flex-direction: row;
  }
}
.details {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 11px;
  @media (min-width: 992px) {
    margin-bottom: 0;
  }
  .detail {
    align-items: center;
    display: flex;
    padding-right: 24px;
    color: #404554;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0px;
    line-height: 16px;
    .svg-icon {
      margin-right: 8px;
    }
  }
}

.dataset-content {
  display: flex;
  flex-direction: row;
  padding: 24px 16px;

  img {
    display: block;
    width: 86px;
    height: 86px;
  }
}

.meta {
  border-top: solid 1px $cortex;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 16px;
  .author {
    font-size: 12px;
    line-height: 14px;
  }
  .tags {
    font-size: 12px;
    line-height: 14px;
  }
}

a {
  &:focus {
    color: #1c46bd;
  }
}
</style>
<style lang="scss">
.dataset-card {
  .dataset-sponsor {
    display: flex;
    flex-wrap: wrap;
    font-size: 12px;
    flex: .2;
    @media (min-width: 992px) {
      display: block;
    }
    h4 {
      color: #000;
      font-size: 12px;
      font-weight: 500;
      margin: 0 4px 0 0;
      @media (min-width: 992px) {
        margin: 0;
      }
    }
    p {
      margin: 0;
    }
  }
}
</style>
