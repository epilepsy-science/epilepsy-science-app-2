<template>
  <Head>
    <Title>{{ title }}</Title>
    <Meta name="og:title" hid="og:title" :content="title" />
    <Meta name="twitter:title" :content="title" />
    <Meta name="description" hid="description" :content="`Browse ${title}`" />
    <Meta name="og:description" hid="og:description" :content="`Browse ${title}`" />
    <Meta name="twitter:description" :content="`Browse ${title}`" />
  </Head>
  <div class="page-data">
    <breadcrumb :breadcrumb="breadcrumb" :title=title />
    <div class="container">
      <h1 hidden>Search for tools and resources</h1>
      <div class="search-tabs__container">
        <h3>
          Browse categories
        </h3>
        <ul class="search-tabs">
          <li v-for="searchType in searchTypes" :key="searchType.label">
            <nuxt-link
              class="search-tabs__button"
              :class="{ active: searchType.path == path }"
              :to="{
                path: searchType.path,
                query: {
                  ...$route.query,
                }
              }"
            >
              {{ searchType.label }}
            </nuxt-link>
          </li>
        </ul>
      </div>
      <div class="search-bar__container">
        <h5>
          Search within category
        </h5>
        <search-controls-contentful
          class="search-bar"
          placeholder="Enter search criteria"
          :path=path
          showSearchText
        />
      </div>
    </div>
    <div class="pb-16 container pt-32">
      <el-row :gutter="32" type="flex">
        <el-col :span="24">
          <el-row :gutter="32">
            <el-col
              class="facet-menu"
              :sm="24"
              :md="6"
              :lg="6"
            >
              <client-only>
                <tools-and-resources-facet-menu
                  :fundingFacets="resourcesFundingFacets"
                  @tool-and-resources-selections-changed="onPaginationPageChange(1)"
                />
              </client-only>
            </el-col>
            <el-col
              :sm='24'
              :md='18'
              :lg='18'
            >
              <div class="search-heading mb-16">
                <div class="label1" v-show="resources.items?.length">
                  {{ resources.total }} Results | Showing
                  <client-only>
                    <pagination-menu
                      :page-size="resources.limit"
                      @update-page-size="onPaginationLimitChange"
                    />
                  </client-only>
                </div>
                <span v-if="resources.items?.length" class="label1">
                  Sort
                  <client-only>
                    <sort-menu  
                      :options="sortOptions"
                      :selected-option="selectedSortOption"
                      @update-selected-option="onSortOptionChange"
                    />
                  </client-only>
                </span>
              </div>
              <div class="subpage">
                <client-only><resources-search-results :table-data="resources.items" /></client-only>
                <alternative-search-results
                  ref="altSearchResults"
                  :search-had-results="resources.items?.length > 0"
                  @vue:mounted="altResultsMounted"
                />
              </div>
              <div class="search-heading">
                <div class="label1" v-if="resources.items?.length">
                  {{ resources.total }} Results | Showing
                  <client-only>
                    <pagination-menu
                      :page-size="resources.limit"
                      @update-page-size="onPaginationLimitChange"
                    />
                  </client-only>
                </div>
                <client-only>
                  <pagination
                    v-if="resources.limit < resources.total"
                    :selected="curSearchPage"
                    :page-size="resources.limit"
                    :total-count="resources.total"
                    @select-page="onPaginationPageChange"
                  />
                </client-only>
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
    <div class="pb-16 pt-16 container">
      <submit-tool-section/>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { propOr } from 'ramda'
import SearchControlsContentful from '@/components/SearchControlsContentful/SearchControlsContentful.vue'
import SortMenu from '@/components/SortMenu/SortMenu.vue'
import ResourcesSearchResults from '@/components/Resources/ResourcesSearchResults.vue'
import ToolsAndResourcesFacetMenu from '@/components/FacetMenu/ToolsAndResourcesFacetMenu.vue'
import AlternativeSearchResults from '@/components/AlternativeSearchResults/AlternativeSearchResultsResources.vue'
import { fetchResources, searchTypes, sortOptions } from '@/pages/resources/utils'
import SubmitToolSection from '@/components/Resources/SubmitToolSection.vue'

export default {
  name: 'ResourcePage',

  components: {
    SearchControlsContentful,
    ResourcesSearchResults,
    ToolsAndResourcesFacetMenu,
    SortMenu,
    SubmitToolSection,
    AlternativeSearchResults
  },

  async setup() {
    const route = useRoute()
    const { $contentfulClient } = useNuxtApp()
    const searchType = searchTypes.find(searchType => searchType.path == route.path)
    const title = searchType.label
    const isTool = title == 'Tools'
    const resources = await fetchResources(undefined, undefined, isTool, route.query.search, undefined, undefined, 10, 0)
    let resourcesFundingFacets = []
    await $contentfulClient.getContentType('sparcPartners').then(contentType => {
      contentType.fields.forEach((field) => {
        if (field.name === 'Program') {
          let fundingItems = field.items?.validations[0]['in']
          let facetData = []
          fundingItems.forEach(itemLabel => {
            facetData.push({
              label: itemLabel,
              id: itemLabel,
            })
          })
          resourcesFundingFacets = facetData
        }
      })
    })
    return {
      resources: ref(resources),
      title,
      resourcesFundingFacets
    }
  },

  data() {
    return {
      selectedSortOption: sortOptions[0],
      sortOptions,
      searchTypes,
      breadcrumb: [
        {
          label: 'Home',
          to: {
            name: 'index'
          }
        },
        {
          label: 'Tools & Resources',
          to: {
            name: 'tools'
          }
        }
      ]
    }
  },

  watch: {
    '$route.query': {
      handler: async function () {
        this.resources = await fetchResources(this.resourceType, this.fundingProgram, this.isTool, this.$route.query.search, this.sortOrder, this.type, 10, 0)
        this.$refs.altSearchResults?.retrieveAltTotals()
      },
      immediate: true
    }
  },

  computed: {
    /**
     * Compute the current page based off the limit and the offset
     * @returns {Number}
     */
    curSearchPage: function() {
      return this.resources.skip / this.resources.limit + 1
    },
    sortOrder: function() {
      return propOr('-fields.name', 'sortOrder', this.selectedSortOption)
    },
    resourceType: function () {
      return this.$route.query.resourceType || undefined
    },
    fundingProgram: function () {
      return this.$route.query.selectedResourcesFundingIds || undefined
    },
    type: function() {
      return this.$route.query.type || undefined
    },
    path() {
      return this.$route.path
    },
    isTool: function () {
      return this.title == 'Tools'
    }
  },

  methods: {
    /**
     * Get more events for the new page
     * @param {Number} page
     */
    async onPaginationPageChange(page) {
      const { limit } = this.resources
      const offset = (page - 1) * limit
      const response = await fetchResources(this.resourceType, this.fundingProgram, this.isTool, this.$route.query.search, this.sortOrder, this.type, limit, offset)
      this.resources = response
    },
    /**
     * Update limit based on pagination menu selection and get more events
     * @param {Number} limit
     */
    async onPaginationLimitChange(limit) {
      const newLimit = limit === 'View All' ? this.resources.total : limit
      const response = await fetchResources(this.resourceType, this.fundingProgram, this.isTool, this.$route.query.search, this.sortOrder, this.type, newLimit, 0)
      this.resources = response
    },
    async onSortOptionChange(option) {
      this.selectedSortOption = option
      const response = await fetchResources(this.resourceType, this.fundingProgram, this.isTool, this.$route.query.search, this.sortOrder, this.type, this.resources.limit, 0)
      this.resources = response
    },
    altResultsMounted() {
      this.$refs.altSearchResults?.retrieveAltTotals()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.page-data {
  background-color: $background;
}
:deep(.resources-search-results__items) {
  border-top: 1px solid $lineColor2;
  padding: 1rem 0;
  &:first-child {
    border: none;
    padding-top: 0;
  }
  &:last-child {
    padding-bottom: 0;
  }
}
.subpage {
  margin-bottom: 1rem;
  margin-top: 1rem;
  padding-bottom: 1rem;
}
.page-wrap {
  margin-bottom: 2.5rem;
}
.search-tabs__container {
  margin-top: 2rem;
  padding-top: 0.5rem;
  background-color: white;
  border: 0.1rem solid $lineColor2;
  h3 {
    padding-left: 0.75rem;
    font-weight: 600;
    font-size: 1.5rem;
  }
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
.search-tabs {
  display: flex;
  list-style: none;
  overflow: auto;
  margin: 0 0 0 0;
  padding: 0 0;
  outline: 0.1rem solid $es-primary-color;
  @media (max-width: 40rem) {
    display: block;
  }
  li {
    width: 100%;
    text-align: center;
    color: $es-primary-color;
  }
  li:last-child > a {
    border-right: none;
  }
}
.search-tabs__button {
  background: $es-primary-color-light;
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  outline: none;
  padding: 0;
  text-decoration: none;
  text-transform: uppercase;
  line-height: 3.5rem;
  @media (min-width: 40rem) {
    font-size: 0.65rem;
    border-right: 0.1rem solid $es-primary-color;
  }
  @media (min-width: 50rem) {
    font-size: .75rem;
  }
  @media (min-width: 64rem) {
    font-size: 1.25rem;
    font-weight: 600;
    text-transform: none;
  }
  &:hover,
  &.active {
    color: white;
    background-color: $es-primary-color;
    font-weight: 500;
  }
}
.search-heading {
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 28em) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 0;
  }
}
.events-facet-menu {
  margin-top: 2rem;
}
</style>
