<template>

  <Head>
    <Title>{{ datasetTitle }}</Title>
    <Meta name="og:title" hid="og:title" :content="datasetTitle" />
    <Meta name="twitter:title" :content="datasetTitle" />
    <Meta name="description" hid="description" :content="datasetDescription" />
    <Meta name="og:description" hid="og:description" :content="datasetDescription" />
    <Meta name="twitter:description" :content="datasetDescription" />
    <Meta name="DC.type" content="Dataset" />
    <Meta name="DC.description" :content="datasetDescription" />
    <Meta name="DCTERMS.license" :content="licenseLink" />
    <Meta name="og:type" content="website" />
    <Meta name="og:title" :content="datasetTitle" />
    <Meta name="og:image" :content="datasetInfo?.banner" />
    <Meta name="og:image:alt" :content="`${datasetTitle} Banner Image`" />
    <Meta name="og:site_name" content="Epilepsy.science" />
    <Meta name="twitter:card" content="summary" />
    <Meta name="twitter:site" content="" />
    <Meta name="twitter:image" :content="datasetInfo?.banner" />
    <Meta name="DC.creator" :content="JSON.stringify(creators)" />
    <Meta name="DC.identifier" :content="doiLink" scheme="DCTERMS.URI" />
    <Meta name="DC.publisher" content="Pennsieve Discover" />
    <Meta name="DC.date" :content="originallyPublishedDate" scheme="DCTERMS.W3CDTF" />
    <Meta name="DC.version" :content="datasetInfo?.version.toString()" />
  </Head>
  <div class="dataset-details pb-16">

      <breadcrumb :breadcrumb="breadcrumb" :title="datasetTitle" />
      <template v-if="hasError">
        <template v-if="errorType == '404'">
          <error404 />
        </template>
        <template v-else>
          <error400 />
        </template>
      </template>
      <div v-else-if="showTombstone">
        <tombstone :dataset-details="datasetInfo" />
      </div>
      <div class="details-container" v-else>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="8" :md="6" :lg="5" class="left-column">
            <dataset-action-box />
          </el-col>
          <el-col :xs="24" :sm="16" :md="18" :lg="19" class="right-column">
            <client-only>
              <content-tab-card class="mt-32" id="datasetDetailsTabsContainer" :tabs="tabs" :active-tab-id="activeTabId"
                @tab-changed="tabChanged" routeName="datasetDetailsTab">
                <dataset-description-info class="body1" v-show="activeTabId === 'abstract'" :markdown="markdown"
                  :loading-markdown="loadingMarkdown"/>
                <citation-details class="body1" v-show="activeTabId === 'cite'" :doi-value="datasetInfo.doi" />
                <dataset-files-info class="body1" v-if="hasFiles" v-show="activeTabId === 'files'" />
              </content-tab-card>
            </client-only>
          </el-col>
        </el-row>
      </div>
      <dataset-version-message v-if="!isLatestVersion" :current-version="datasetInfo.version"
        :dataset-details="datasetInfo" />
    
  </div>
</template>

<script>
// TODO - Not urgent: clean up organizationName, doiLink and other organization name references that are not applicable to ES
import Tombstone from '@/components/Tombstone/Tombstone.vue'
import { clone, propOr, pathOr, head, compose } from 'ramda'
import { getAlgoliaFacets, facetPropPathMapping } from '../../utils/algolia'
import { useMainStore } from '../store/index.js'
import { mapState, mapActions } from 'pinia'
import DatasetVersionMessage from '@/components/DatasetVersionMessage/DatasetVersionMessage.vue'
import DatasetActionBox from '@/components/DatasetDetails/DatasetActionBox.vue'
import Scaffolds from '@/static/js/scaffolds.js'
import DateUtils from '@/mixins/format-date'
import FormatStorage from '@/mixins/bf-storage-metrics'
import DatasetDescriptionInfo from '@/components/DatasetDetails/DatasetDescriptionInfo.vue'
import CitationDetails from '@/components/CitationDetails/CitationDetails.vue'
import DatasetFilesInfo from '@/components/DatasetDetails/DatasetFilesInfo.vue'
import error404 from '~/components/Error/Error404.vue'
import error400 from '~/components/Error/Error400.vue'
import { getLicenseLink, getLicenseAbbr } from '@/static/js/license-util'
import { ref } from 'vue'

const getDatasetDetails = async (config, datasetId, version, $pennsieveApiClient) => {

  const pennsieveUrl = `${config.public.discover_api_host}/datasets/${datasetId}`
  var pennsieveDatasetUrl = version ? `${pennsieveUrl}/versions/${version}` : pennsieveUrl
  const datasetDetails = await $pennsieveApiClient.value.get(pennsieveDatasetUrl).catch((error) => {
        const status = pathOr('', ['data', 'status'], error.response)
        if (status === 'UNPUBLISHED') {
          const details = error.response.data
          return {
            isUnpublished: true,
            ...details
          }
        }
      })
  return datasetDetails
}

const getDatasetVersions = async (config, datasetId, axios) => {
  try {
    const url = `${config.public.discover_api_host}/datasets/${datasetId}/versions`
    return axios.get(url).then(({ data }) => {
      return data.sort((a, b) => a.verson - b.version)
    })
  } catch (error) {
    return []
  }
}

const getOrganizationNames = async (algoliaIndex) => {
  try {
    await algoliaIndex.search('', {
      sortFacetValuesBy: 'alpha',
      facets: 'pennsieve.organization.name',
    }).then(({ facets }) => {
      return facets['pennsieve.organization.name'].keys()
    })
  } catch (error) {
    return [
      'SPARC',
      'SPARC Consortium',
      'RE-JOIN',
      'HEAL PRECISION',
      "IT'IS Foundation"
    ]
  }
}

const tabs = [
  {
    label: 'Abstract',
    id: 'abstract'
  },
  {
    label: 'Cite',
    id: 'cite'
  },
]

export default {
  name: 'DatasetDetails',

  components: {
    Tombstone,
    DatasetVersionMessage,
    DatasetActionBox,
    DatasetDescriptionInfo,
    CitationDetails,
    DatasetFilesInfo,
    error400,
    error404
  },

  mixins: [DateUtils, FormatStorage],

  async setup() {
    const route = useRoute()
    const config = useRuntimeConfig()
    const { $algoliaClient, $axios, $pennsieveApiClient } = useNuxtApp()
    const algoliaIndex = await $algoliaClient.initIndex(config.public.ALGOLIA_INDEX_PUBLISHED_TIME_DESC)
    let hasError = ref(false);
    let errorType = ref("");

    let tabsData = clone(tabs)
    const datasetId = route.params.datasetId
    const filter = `objectID:${datasetId}`
    const datasetFacetsData = await getAlgoliaFacets(algoliaIndex, facetPropPathMapping, filter).then(data => {
      return data
    })

    const store = useMainStore()
    try {
      let [datasetDetails, versions, sparcOrganizationNames] = await Promise.all([
        getDatasetDetails(
          config,
          datasetId,
          route.params.version,
          $pennsieveApiClient
        ),
        getDatasetVersions(config, datasetId, $axios),
        getOrganizationNames(algoliaIndex)
      ])
      
      datasetDetails = propOr(datasetDetails, 'data', datasetDetails)
      const latestVersion = compose(propOr(1, 'version'), head)(versions)
      store.setDatasetInfo({ ...datasetDetails, 'latestVersion': latestVersion })
      store.setDatasetFacetsData(datasetFacetsData)
      // Creator data
      const org = [
        {
          '@type': 'Organization',
          name: propOr('', 'organizationName', datasetDetails)
        }
      ]
      const contributors = datasetDetails?.contributors?.map(contributor => {
        const sameAs = contributor.orcid
          ? `http://orcid.org/${contributor.orcid}`
          : null

        return {
          '@type': 'Person',
          sameAs,
          givenName: contributor.firstName,
          familyName: contributor.lastName,
          name: `${contributor.firstName} ${contributor.lastName}`
        }
      })

      const creators = contributors?.concat(org)
      const doi = propOr('', 'doi', datasetDetails)
      const doiLink = doi ? `https://doi.org/${doi}` : ''
      let originallyPublishedDate = propOr('', 'firstPublishedAt', datasetDetails)
      const showTombstone = propOr(false, 'isUnpublished', datasetDetails)

      return {
        tabs: tabsData,
        versions,
        showTombstone,
        algoliaIndex,
        originallyPublishedDate,
        creators,
        hasError,
        errorType
      }
    } catch (error) {
      // TODO: status code is not available from the error object, must retrieve error code alternatively
      const status = pathOr('', ['response', 'status'], error)
      store.setDatasetInfo({})
      hasError = true
      return {
        hasError, errorType
      }
    }
  },

  data() {
    return {
      breadcrumb: [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        },
        {
          to: {
            name: 'data',
            query: {
              type: this.$route.query.type
            }
          },
          label: 'Data & Models'
        }
      ],
      activeTabId: this.$route.query.datasetDetailsTab ? this.$route.query.datasetDetailsTab : 'abstract',
      markdown: {},
      loadingMarkdown: false,
      isLoadingDataset: false,
      errorLoading: false,
      sparcAwardNumbers: [],
      showCopySuccess: false,
      subtitles: [],
    }
  },

  async created() {
    if (this.datasetInfo) {
      this.setDatasetInfo({ ...this.datasetInfo })
    }
  },
  
  computed: {
    ...mapState(useMainStore, ['datasetInfo', 'datasetFacetsData']),
    defaultTab() {
      return this.tabs[0].id
    },
    embargoAccess() {
      return propOr(null, 'embargoAccess', this.datasetInfo)
    },
    isLatestVersion() {
      if (this.versions !== undefined && this.versions.length) {
        const latestVersion = compose(propOr(1, 'version'), head)(this.versions)
        return this.datasetInfo.version === latestVersion
      }

      return true
    },
    licenseLink: function () {
      return getLicenseLink(this.datasetLicense)
    },
    datasetLicense: function () {
      const licenseKey = propOr('', 'license', this.datasetInfo)
      return getLicenseAbbr(licenseKey)
    },
    getDatasetImage: function () {
      return propOr('', 'banner', this.datasetInfo)
    },
    datasetContributors: function () {
      return propOr([], 'contributors', this.datasetInfo)
    },
    datasetTitle: function () {
      return propOr('', 'name', this.datasetInfo)
    },
    datasetId: function () {
      return pathOr('', ['params', 'datasetId'], this.$route)
    },
    hasFiles: function () {
      return this.fileCount >= 1
    },
    fileCount: function () {
      return propOr('0', 'fileCount', this.datasetInfo)
    },
    externalPublications: function () {
      return propOr([], 'externalPublications', this.datasetInfo)
    },
    doiLink: function () {
      const doi = propOr('', 'doi', this.datasetInfo)
      return doi ? `https://doi.org/${doi}` : ''
    },
    datasetDescription: function () {
      return propOr('', 'description', this.datasetInfo)
    },
    datasetName: function () {
      return propOr('', 'name', this.datasetInfo)
    },
    organizationName: function () {
      return propOr('', 'organizationName', this.datasetInfo)
    },
    // This assumes that the subtitles are the organ types
    organType: function () {
      return this.subtitles[0] || ''
    },
    scaffold: function () {
      return Scaffolds[this.organType.toLowerCase()]
    }
  },

  watch: {
    '$route.query': 'queryChanged',
    datasetInfo: {
      handler: function () {
        this.getMarkdown()
      },
    },
    hasFiles: {
      handler: function (newValue) {
        if (newValue && !this.hasError) {
          const hasFilesTab = this.tabs.find(tab => tab.id === 'files') !== undefined
          if (!hasFilesTab) {
            this.tabs.splice(3, 0, { label: 'Files', id: 'files' })
          }
        }
      },
      immediate: true
    },
  },
  methods: {
    tabChanged(newTab) {
      this.activeTabId = newTab.id
      this.$router.replace({ path: this.$route.path, query: { ...this.$route.query, datasetDetailsTab: newTab.id } })
    },
    ...mapActions(useMainStore, ['setDatasetInfo', 'setDatasetFacetData']),
    queryChanged: function () {
      this.activeTabId = this.$route.query.datasetDetailsTab
        ? this.$route.query.datasetDetailsTab
        : this.defaultTab
    },
    getMarkdown: function () {
      this.loadingMarkdown = true
      const readme = propOr('', 'readme', this.datasetInfo)
      if (readme !== '') {
        fetch(readme)
          .then(response => response.text())
          .then(response => {
            this.loadingMarkdown = false
            const splitDelim = '\\n---'
            let splitResponse = response.split(splitDelim)
            splitResponse = splitResponse.map(i => {
              if (i < splitResponse.length - 1) {
                return `${i}${splitDelim}`
              } else {
                return `${i}`
              }
            })
            this.markdown = {
              markdownTop: splitResponse[0].toString(),
              markdownBottom: splitResponse[1]
                ? splitResponse.slice(1).toString()
                : ''
            }
          })
          .catch(error => {
            throw error
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.left-column {
  @media (max-width: 48rem) {
    order: 1;
    margin-top: 0;
  }
}
.details-container {
  padding: 0 3rem;
  @media (max-width: 62rem) {
    padding: 0 1rem;
  }
}

:deep(.card-container) {
  .content {
      a {
        color: $es-primary-color;
      }
  }
}
.dataset-details {
  background-color: $background;
  width: 100%;
  overflow-x: hidden;
}
</style>
