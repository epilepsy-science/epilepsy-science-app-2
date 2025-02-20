<template>
  <Head>
    <Title>{{ searchType.label }}</Title>
    <Meta name="og:title" hid="og:title" :content="title" />
    <Meta name="twitter:title" :content="title" />
    <Meta name="description" hid="description" :content="`Browse ${title}`" />
    <Meta name="og:description" hid="og:description" :content="`Browse ${title}`" />
    <Meta name="twitter:description" :content="`Browse ${title}`" />
  </Head>
  <div class="page-data">
    <breadcrumb :breadcrumb="breadcrumb" :title="searchType.label" />
    <div class="container">
      <div class="search-bar__container">
        <div class="body1 mb-8">
          Search within category
        </div>
        <search-controls-contentful class="search-bar" placeholder="Enter search criteria" :path="$route.path"
          showSearchText />
      </div>
    </div>
    <div class="container">
      <el-row :gutter="32" type="flex">
        <el-col :span="24">
          <el-row :gutter="32">
            <el-col class="facet-menu" :sm="24" :md="8" :lg="6">
              <client-only>
                <dataset-facet-menu :facets="facets" :visible-facets="visibleFacets"
                  @selected-facets-changed="onFacetSelectionChange()" @hook:mounted="facetMenuMounted"
                  ref="datasetFacetMenu" />
              </client-only>
            </el-col>
            <el-col :sm="searchColSpan('sm')" :md="searchColSpan('md')" :lg="searchColSpan('lg')">
              <div class="search-heading">
                <p v-show="!isLoadingSearch && searchData.items.length">
                  {{ searchData.total }} Results | Showing
                  <client-only>
                    <pagination-menu :page-size="searchData.limit" @update-page-size="updateDataSearchLimit" />
                  </client-only>
                </p>
                <span v-if="searchData.items.length" class="label1">
                  Sort
                  <sort-menu :options="algoliaSortOptions" :selected-option="selectedAlgoliaSortOption"
                    @update-selected-option="onAlgoliaSortOptionChange" />
                </span>
              </div>
              <div v-loading="isLoadingSearch" class="table-wrap">
                <p v-if="searchFailed" class="search-error">
                  Sorry, the search engine has encountered an unexpected
                  error, please try again later.
                </p>
                <dataset-search-results :tableData="tableData" />
              </div>
              <div class="search-heading">
                <p v-if="!isLoadingSearch && searchData.items.length">
                  {{ searchHeading }} | Showing
                  <client-only>
                    <pagination-menu :page-size="searchData.limit" @update-page-size="updateDataSearchLimit" />
                  </client-only>
                </p>
                <client-only>
                  <pagination v-if="searchData.limit < searchData.total" :selected="curSearchPage"
                    :page-size="searchData.limit" :total-count="searchData.total" @select-page="onPaginationPageChange" />
                </client-only>
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import {
  compose,
  defaultTo,
  head,
  mergeLeft,
  pathOr,
  propOr
} from 'ramda'
import SearchControlsContentful from '@/components/SearchControlsContentful/SearchControlsContentful.vue'
import DatasetFacetMenu from '@/components/FacetMenu/DatasetFacetMenu.vue'
import { facetPropPathMapping, getAlgoliaFacets } from '../../utils/algolia'
import { HIGHLIGHT_HTML_TAG } from '../../utils/utils'
import DatasetSearchResults from '@/components/SearchResults/DatasetSearchResults.vue'
import SortMenu from '@/components/SortMenu/SortMenu.vue'

const searchResultsComponents = {
  dataset: DatasetSearchResults,
  simulation: DatasetSearchResults,
  model: DatasetSearchResults
}

const searchTypes = [
  {
    label: 'Datasets',
    type: 'dataset',
  },
  {
    label: 'Anatomical Models',
    type: 'model',
  },
  {
    label: 'Computational Models',
    type: 'simulation',
  }
]

export default {
  name: 'DataPage',

  components: {
    SearchControlsContentful,
    DatasetFacetMenu,
    DatasetSearchResults,
    SortMenu,
  },

  async setup() {
    const config = useRuntimeConfig()
    const route = useRoute()
    if (route.query.type == 'projects') {
      const focusQuery = route.query.selectedProjectsAnatomicalFocusIds
      let newPath = '/about/projects?consortiaType=SPARC'
      if (focusQuery) {
        newPath += `&selectedProjectsAnatomicalFocusIds=${focusQuery}`
      }
      return navigateTo(newPath)
    }
    const { $algoliaClient } = useNuxtApp()
    const algoliaSortOptions = [
      {
        label: 'Date (desc)',
        id: 'newest',
        algoliaIndexName: config.public.ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_DESC
      },
      {
        label: 'Date (asc)',
        id: 'oldest',
        algoliaIndexName: config.public.ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_ASC
      },
      {
        label: 'A-Z',
        id: 'alphabetical',
        algoliaIndexName: config.public.ALGOLIA_INDEX_ALPHABETICAL_A_Z
      },
      {
        label: 'Z-A',
        id: 'reverseAlphabetical',
        algoliaIndexName: config.public.ALGOLIA_INDEX_ALPHABETICAL_Z_A
      },
    ]
    const algoliaIndex = await $algoliaClient.initIndex(config.public.ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_DESC)

    const searchType = searchTypes.find(searchType => {
      return searchType.type == route.query.type
    })
    const title = propOr('', 'label', searchType)
    return {
      algoliaSortOptions,
      selectedAlgoliaSortOption: ref(algoliaSortOptions.find(opt => opt.id === route.query.datasetSort) || algoliaSortOptions[0]),
      algoliaIndex,
      title
    }
  },

  data: () => {
    return {
      searchQuery: '',
      searchData: {
        limit: 10,
        skip: 0,
        items: [],
        total: 0
      },
      facets: [],
      visibleFacets: {},
      isLoadingSearch: false,
      searchFailed: false,
      isSearchMapVisible: false,
      latestSearchTerm: '',
      searchTypes: searchTypes,
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
              type: 'dataset'
            }
          },
          label: 'Data & Models'
        },
      ],
      titleColumnWidth: 300,
      windowWidth: ''
    }
  },

  computed: {
    searchType: function () {
      const searchTypeQuery = pathOr('', ['query', 'type'], this.$route)
      const searchType = this.searchTypes.find(searchType => {
        return searchType.type == searchTypeQuery
      })

      return defaultTo(head(this.searchTypes), searchType)
    },

    tableData: function () {
      return propOr([], 'items', this.searchData)
    },

    searchResultsComponent: function () {
      return defaultTo('', searchResultsComponents[this.$route.query.type])
    },

    curSearchPage: function () {
      return this.searchData.skip / this.searchData.limit + 1
    },

    searchHeading: function () {
      const query = pathOr('', ['query', 'search'], this.$route)

      const searchType = this.searchTypes.find(searchType => {
        return searchType.type == this.$route.query.type
      })
      const searchTypeLabel = propOr('', 'label', searchType)

      let searchHeading = `${this.searchData.total} ${searchTypeLabel}`

      return query === '' ? searchHeading : `${searchHeading} for “${query}”`
    },

    search: function () {
      return this.$route.query.search || ''
    },

    isMobile: function () {
      return this.windowWidth <= 500
    }
  },

  watch: {
    '$route.query.type': function (val) {
      if (!this.$route.query.type) {
        return
      } else {
        this.searchData = {
          limit: 10,
          skip: 0,
          items: [],
          total: 0
        }
        this.fetchResults()
      }
    },

    '$route.query.search': {
      handler: function () {
        this.searchQuery = this.$route.query.search
        this.fetchResults()
      },
      immediate: true
    },

    '$route.query.datasetSort': {
      handler: function () {
        this.fetchResults()
      },
      immediate: true
    },

    selectedAlgoliaSortOption: {
      handler: function (option) {
        this.algoliaIndex = this.$algoliaClient.initIndex(option.algoliaIndexName)
      },
      immediate: true
    }
  },

  beforeMount: function () {
    this.windowWidth = window.innerWidth
  },
  mounted: function () {
    if (!this.$route.query.type) {
      const firstTabType = compose(propOr('', 'type'), head)(searchTypes)
      this.$router.replace({ query: { type: firstTabType } })
    } else {
      const queryParams = {
        skip: Number(this.$route.query.skip || this.searchData.skip),
        limit: Number(this.$route.query.limit || this.searchData.limit),
        search: this.$route.query.search || ''
      }

      this.searchData = { ...this.searchData, ...queryParams }
    }
    if (window.innerWidth <= 768) this.titleColumnWidth = 150
    window.onresize = () => this.onResize(window.innerWidth)
    getAlgoliaFacets(this.algoliaIndex, facetPropPathMapping)
      .then(data => {
        this.facets = data
      })
      .finally(() => {
        this.fetchResults()
      })
  },

  methods: {
    updateDataSearchLimit: function (limit) {
      this.searchData.skip = 0

      const newLimit = limit === 'View All' ? this.searchData.total : limit

      this.searchData.limit = newLimit
      this.$router.replace({
        query: { ...this.$route.query, limit: newLimit, skip: 0 }
      })
      this.fetchResults()
    },

    facetMenuMounted: function () {
      this.fetchResults()
    },

    fetchResults: function () {
      this.isLoadingSearch = true
      this.searchFailed = false
      const query = this.$route.query.search

      const searchType = pathOr('dataset', ['query', 'type'], this.$route)

      /* First we need to find only those facets that are relevant to the search query.
       * If we attempt to do this in the same search as below than the response facets
       * will only contain those specified by the filter */
      this.latestSearchTerm = query
      this.algoliaIndex
        .search(query, {
          facets: ['*'],
        })
        .then(response => {
          this.visibleFacets = response.facets
        })
        .catch(() => {
          this.isLoadingSearch = false
          this.searchFailed = true
        })
        .finally(() => {
          var filters = this.$refs.datasetFacetMenu?.getFilters()
          filters = filters === undefined ?
            '' :
            filters 

          this.algoliaIndex
            .search(query, {
              facets: ['*'],
              hitsPerPage: this.searchData.limit,
              page: this.curSearchPage - 1,
              filters: filters,
              attributesToHighlight: [
                'item.name',
                'item.description',
              ],
              highlightPreTag: `<${HIGHLIGHT_HTML_TAG}>`,
              highlightPostTag: `</${HIGHLIGHT_HTML_TAG}>`
            })
            .then(response => {
              const searchData = {
                items: response.hits,
                total: response.nbHits
              }
              this.searchData = mergeLeft(searchData, this.searchData)
              this.isLoadingSearch = false
            })
            .catch(() => {
              this.isLoadingSearch = false
              this.searchFailed = true
            })
        })
    },

    onFacetSelectionChange: function () {
      this.searchData.skip = 0
      this.fetchResults()
    },

    onPaginationPageChange: function (page) {
      const offset = (page - 1) * this.searchData.limit
      this.searchData.skip = offset

      this.$router.replace({
        query: { ...this.$route.query, skip: offset }
      })

      this.fetchResults()
    },

    onResize: function (width) {
      width <= 768
        ? (this.titleColumnWidth = 150)
        : (this.titleColumnWidth = 300)
      this.windowWidth = width
    },

    searchColSpan(viewport) {
      const viewports = {
        sm: 24,
        md: 16,
        lg: 18
      }

      return viewports[viewport] || 24
    },
    async onAlgoliaSortOptionChange(option) {
      this.selectedAlgoliaSortOption = option
      this.searchData.skip = 0
      this.$router.replace({
        query: {
          ...this.$route.query,
          skip: 0,
          datasetSort: option.id
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.alternative-links {
  text-decoration: underline;
  color: $es-primary-color;
}

.page-data {
  background-color: $background;
}

.search-bar__container {
  margin-top: 1em;
  padding: 0.75rem;
  border: 0.1rem solid $lineColor2;
  background: white;

  h5 {
    line-height: 1rem;
    font-weight: 600;
    font-size: 1rem;
  }
}

.table-wrap {
  background: #fff;
  border: 1px solid $lineColor2;
  padding: 16px;

  .search-error {
    margin: 0 0 auto;
    text-align: center;
  }
}

.search-heading {
  align-items: flex-end;
  display: flex;
  margin-bottom: 1em;
  justify-content: space-between;

  @media screen and (max-width: 28em) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 0;
  }

  p {
    font-size: 0.875em;
    flex-shrink: 0;
    margin: 2em 0 0 0;
  }
}

.facet-menu {
  margin-top: 2em;
}

:deep(.el-table td) {
  vertical-align: top;
}

:deep(.el-table .cell) {
  word-break: normal;
}

.dataset-filters {
  padding: 0.5rem 1rem 1rem;
  margin-bottom: 2rem;

  h2,
  h3 {
    font-size: 1.125rem;
    font-weight: normal;
    line-height: 1.2;
  }

  h2 {
    border-bottom: 1px solid $lineColor1;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
  }

  h3 {
    font-size: 0.875rem;
    text-transform: uppercase;
  }

  :deep(.el-checkbox-group) {
    display: flex;
    flex-direction: column;
  }

  :deep(.el-checkbox__label) {
    color: $es-primary-color;
  }
}
</style>
