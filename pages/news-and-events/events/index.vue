<template>
  <Head>
    <Title>{{ searchTypes[1].label }}</Title>
    <Meta name="og:title" hid="og:title" :content="searchTypes[1].label" />
    <Meta name="twitter:title" :content="searchTypes[1].label" />
    <Meta name="description" hid="description" :content="`Browse ${searchTypes[1].label}`" />
    <Meta name="og:description" hid="og:description" :content="`Browse ${searchTypes[1].label}`" />
    <Meta name="twitter:description" :content="`Browse ${searchTypes[1].label}`" />
  </Head>
  <div class="page-data">
    <breadcrumb :breadcrumb="breadcrumb" title="Events" />
    <div class="container">
      <h1 hidden>Search for events</h1>
      <div class="search-tabs__container">
        <h3>
          Browse categories
        </h3>
        <ul class="search-tabs">
          <li v-for="searchType in searchTypes" :key="searchType.label">
            <nuxt-link
              class="search-tabs__button"
              :class="{ active: searchType.path === 'events' }"
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
          path="/news-and-events/events"
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
                <events-facet-menu
                  ref="eventsFacetMenu"
                  class="events-facet-menu"
                  @events-selections-changed="onPaginationPageChange(1)"
                />
              </client-only>
            </el-col>
            <el-col
              :sm='24'
              :md='18'
              :lg='18'
            >
              <div class="search-heading mt-32 mb-16">
                <div class="label1" v-show="events.items.length">
                  {{ events.total }} Results | Showing
                  <client-only>
                    <pagination-menu
                      :page-size="events.limit"
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
              <div ref="eventsWrap" class="subpage">
                <client-only>
                  <event-list-item
                    v-for="item in events.items"
                    :key="item.sys.id"
                    :item="item"
                    :show-past-events-divider="showPastEventsDivider && item.sys.id == firstPastEventId"
                  />
                  <alternative-search-results-news
                    ref="altSearchResults"
                    :search-had-results="events.items.length > 0"
                    @vue:mounted="altResultsMounted"
                  />
                </client-only>
              </div>
              <div class="search-heading">
                <div class="label1" v-if="events.items.length">
                  {{ events.total }} Results | Showing
                  <client-only>
                    <pagination-menu
                      :page-size="events.limit"
                      @update-page-size="onPaginationLimitChange"
                    />
                  </client-only>
                </div>
                <client-only>
                  <pagination
                    v-if="events.limit < events.total"
                    :selected="curSearchPage"
                    :page-size="events.limit"
                    :total-count="events.total"
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
import { pathOr, propOr } from 'ramda'
import EventsFacetMenu from '@/components/FacetMenu/EventsFacetMenu.vue'
import EventListItem from '@/components/EventListItem/EventListItem.vue'
import SearchControlsContentful from '@/components/SearchControlsContentful/SearchControlsContentful.vue'
import SortMenu from '@/components/SortMenu/SortMenu.vue'
import SubmitNewsSection from '~/components/NewsEventsResourcesPage/SubmitNewsSection.vue'
import AlternativeSearchResultsNews from '~/components/AlternativeSearchResults/AlternativeSearchResultsNews.vue'

import { fetchEvents } from '../model'

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
    label: 'Upcoming',
    id: 'upcoming',
    sortOrder: '-fields.upcomingSortOrder'
  },
  {
    label: 'Latest',
    id: 'latest',
    sortOrder: '-fields.startDate'
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
  name: 'EventsPage',

  components: {
    AlternativeSearchResultsNews,
    EventsFacetMenu,
    EventListItem,
    SearchControlsContentful,
    SortMenu,
    SubmitNewsSection
  },

  async setup() {
    const route = useRoute()
    const { $contentfulClient } = useNuxtApp()
    const events = await fetchEvents($contentfulClient, route.query.search, undefined, undefined, undefined, undefined, 10, 0)
    return {
      events: ref(events)
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
        this.events = await fetchEvents(
          $contentfulClient,
          this.$route.query.search, 
          this.$refs.eventsFacetMenu?.getStartLessThanDate(), 
          this.$refs.eventsFacetMenu?.getStartGreaterThanOrEqualToDate(),
          this.eventTypes, 
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
      return this.events.skip / this.events.limit + 1
    },
    startLessThanDate: function() {
      return this.$refs.eventsFacetMenu?.getStartLessThanDate()
    },
    startGreaterThanOrEqualToDate: function() {
      return this.$refs.eventsFacetMenu?.getStartGreaterThanOrEqualToDate()
    },
    eventTypes: function() {
      return this.$route.query.selectedEventTypeOptions || undefined
    },
    sortOrder: function() {
      return propOr('-fields.startDate', 'sortOrder', this.selectedSortOption)
    },
    firstPastEventId: function() {
      const events = propOr([], 'items', this.events)
      for (let i = 0; i < events.length; i++) {
        const event = events[i]
        const upcomingSortOrder = pathOr("", ['fields','upcomingSortOrder'], event)
        if (upcomingSortOrder < 0) {
          return pathOr("", ['sys','id'], event)
        }
      }
      return -1
    },
    showPastEventsDivider: function() {
      if (this.selectedSortOption.id != "upcoming") {
        return false
      }
      const events = propOr([], 'items', this.events)
      if (events.length == 0) {
        return false
      }
      const firstEventId = pathOr(-1, ['sys', 'id'], events[0])
      return this.firstPastEventId != firstEventId
    }
  },

  methods: {
    /**
     * Get more events for the new page
     * @param {Number} page
     */
    async onPaginationPageChange(page) {
      const { $contentfulClient } = useNuxtApp()
      const { limit } = this.events
      const offset = (page - 1) * limit
      const response = await fetchEvents($contentfulClient, this.$route.query.search, this.startLessThanDate, this.startGreaterThanOrEqualToDate, this.eventTypes, this.sortOrder, limit, offset)
      this.events = response
    },
    /**
     * Update limit based on pagination menu selection and get more events
     * @param {Number} limit
     */
    async onPaginationLimitChange(limit) {
      const { $contentfulClient } = useNuxtApp()
      const newLimit = limit === 'View All' ? this.events.total : limit
      const response = await fetchEvents($contentfulClient, this.$route.query.search, this.startLessThanDate, this.startGreaterThanOrEqualToDate, this.eventTypes, this.sortOrder, newLimit, 0)
      this.events = response
    },
    async onSortOptionChange(option) {
      const { $contentfulClient } = useNuxtApp()
      this.selectedSortOption = option
      const response = await fetchEvents($contentfulClient, this.$route.query.search, this.startLessThanDate, this.startGreaterThanOrEqualToDate, this.eventTypes, this.sortOrder, this.events.limit, 0)
      this.events = response
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
.event-list-item {
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
:deep(.past-events-divider) {
  border-top: none;
  padding-top: 0;
}
.subpage {
  margin-bottom: 1rem;
  margin-top: 1rem;
  padding-bottom: 1rem;
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
