<template>
  <Head>
    <Title>{{ searchTypes[0].label }}</Title>
    <Meta name="og:title" hid="og:title" :content="searchTypes[0].label" />
    <Meta name="twitter:title" :content="searchTypes[0].label" />
    <Meta name="description" hid="description" :content="`Browse ${searchTypes[0].label}`" />
    <Meta name="og:description" hid="og:description" :content="`Browse ${searchTypes[0].label}`" />
    <Meta name="twitter:description" :content="`Browse ${searchTypes[0].label}`" />
  </Head>
  <div class="page-data">
    <breadcrumb :breadcrumb="breadcrumb" title="News" />
    <div class="container">
      <h1 hidden>Search for news</h1>
      <div class="search-tabs__container">
        <h3>
          Browse categories
        </h3>
        <ul class="search-tabs">
          <li v-for="searchType in searchTypes" :key="searchType.label">
            <nuxt-link
              class="search-tabs__button"
              :class="{ active: searchType.path === 'news' }"
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
          path="/news-and-events/news"
          showSearchText
        />
      </div>
    </div>
    <div class="pb-16 container">
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
                  <news-facet-menu
                    ref="newsFacetMenu"
                    class="news-facet-menu"
                    @news-selections-changed="onPaginationPageChange(1)"
                  />
                </client-only>
              </el-col>
              <el-col
                :sm='24'
                :md='18'
                :lg='18'
              >
                <div class="search-heading mt-32 mb-16">
                  <div class="label1" v-show="news.items?.length">
                    {{ news.total }} Results | Showing
                    <client-only>
                      <pagination-menu
                        :page-size="news.limit"
                        @update-page-size="onPaginationLimitChange"
                      />
                    </client-only>
                  </div>
                  <span class="label1">
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
                  <template v-for="(item, index) in news.items" :key="index">
                    <news-list-item
                      :item="item"
                    />
                  </template>
                  <client-only>
                    <alternative-search-results-news
                      ref="altSearchResults"
                      :search-had-results="news.items.length > 0"
                      @vue:mounted="altResultsMounted"
                    />
                  </client-only>
                </div>
                <div class="search-heading">
                  <div class="label1" v-if="news.items?.length">
                    {{ news.total }} Results | Showing
                    <client-only>
                      <pagination-menu
                        :page-size="news.limit"
                        @update-page-size="onPaginationLimitChange"
                      />
                    </client-only>
                  </div>
                  <client-only>
                    <pagination
                      v-if="news.limit < news.total"
                      :selected="curSearchPage"
                      :page-size="news.limit"
                      :total-count="news.total"
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
      <submit-news-section/>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { propOr } from 'ramda'
import NewsFacetMenu from '@/components/FacetMenu/NewsFacetMenu.vue'
import NewsListItem from '@/components/NewsListItem/NewsListItem.vue'
import SearchControlsContentful from '@/components/SearchControlsContentful/SearchControlsContentful.vue';
import SortMenu from '@/components/SortMenu/SortMenu.vue'
import SubmitNewsSection from '~/components/NewsEventsResourcesPage/SubmitNewsSection.vue'
import AlternativeSearchResultsNews from '~/components/AlternativeSearchResults/AlternativeSearchResultsNews.vue'

import { fetchNews } from '../model'

const searchTypes = [
  {
    label: 'News',
    path: 'news'
  },
  {
    label: 'Events',
    path: 'events'
  }
]

const sortOptions = [
  {
    label: 'Latest',
    id: 'latest',
    sortOrder: '-fields.publishedDate'
  },
  {
    label: 'A-Z',
    id: 'alphabatical',
    sortOrder: 'fields.title'
  },
  {
    label: 'Z-A',
    id: 'reverseAlphabatical',
    sortOrder: '-fields.title'
  },
]

export default {
  name: 'NewsPage',

  components: {
    NewsFacetMenu,
    NewsListItem,
    SearchControlsContentful,
    SortMenu,
    SubmitNewsSection,
    AlternativeSearchResultsNews
  },

  async setup() {
    const route = useRoute()
    const { $contentfulClient } = useNuxtApp()
    const news = await fetchNews($contentfulClient, route.query.search, undefined, undefined, undefined, undefined, 10, 0)
    return {
      news : ref(news)
    }
  },

  data() {
    return {
      searchTypes,
      selectedSortOption: sortOptions[0],
      sortOptions,
      breadcrumb: [
        {
          label: 'Home',
          to: {
            name: 'index'
          }
        },
        {
          label: 'News & Events',
          to: {
            name: 'news-and-events'
          }
        }
      ]
    }
  },

  watch: {
    '$route.query': {
      handler: async function() {
          const { $contentfulClient } = useNuxtApp()
          this.news = await fetchNews(
            $contentfulClient,
            this.$route.query.search, 
            this.$refs.newsFacetMenu?.getPublishedLessThanDate(), 
            this.$refs.newsFacetMenu?.getPublishedGreaterThanOrEqualToDate(),
            this.subjects, 
            this.sortOrder, 
            10, 
            0
          )
          this.$refs.altSearchResults?.retrieveAltTotals()
      },
      immediate: true
    },
  },

  computed: {
    /**
     * Compute the current page based off the limit and the offset
     * @returns {Number}
     */
    curSearchPage: function() {
      return this.news.skip / this.news.limit + 1
    },
    publishedLessThanDate: function() {
      return this.$refs.newsFacetMenu?.getPublishedLessThanDate()
    },
    publishedGreaterThanOrEqualToDate: function() {
      return this.$refs.newsFacetMenu?.getPublishedGreaterThanOrEqualToDate()
    },
    subjects: function() {
      return this.$route.query.selectedNewsSubjectIds || undefined
    },
    sortOrder: function() {
      return propOr('-fields.publishedDate', 'sortOrder', this.selectedSortOption)
    }
  },

  methods: {
    async onPaginationPageChange(page) {
      const { $contentfulClient } = useNuxtApp()
      const { limit } = this.news
      const offset = (page - 1) * limit
      const response = await fetchNews($contentfulClient, this.$route.query.search, this.publishedLessThanDate, this.publishedGreaterThanOrEqualToDate, this.subjects, this.sortOrder, limit, offset)
      this.news = response
    },
    /**
     * Update limit based on pagination menu selection and get more news
     * @param {Number} limit
     */
    async onPaginationLimitChange(limit) {
      const { $contentfulClient } = useNuxtApp()
      const newLimit = limit === 'View All' ? this.news.total : limit
      const response = await fetchNews($contentfulClient, this.$route.query.search, this.publishedLessThanDate, this.publishedGreaterThanOrEqualToDate, this.subjects, this.sortOrder, newLimit, 0)
      this.news = response
    },
    async onSortOptionChange(option) {
      const { $contentfulClient } = useNuxtApp()
      this.selectedSortOption = option
      const response = await fetchNews($contentfulClient, this.$route.query.search, this.publishedLessThanDate, this.publishedGreaterThanOrEqualToDate, this.subjects, this.sortOrder, this.news.limit, 0)
      this.news = response
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
.news-list-item {
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
  margin-bottom: .5rem;
  margin-top: .5rem;
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
.news-facet-menu {
  margin-top: 2rem;
}
</style>
