<template>
  <Head>
    <Title>{{ page.fields.page_title }}</Title>
    <Meta name="og:title" hid="og:title" :content="page.fields.page_title" />
    <Meta name="twitter:title" :content="page.fields.page_title" />
    <Meta name="description" hid="description" :content="page.fields.heroCopy" />
    <Meta name="og:description" hid="og:description" :content="page.fields.heroCopy" />
    <Meta name="twitter:description" :content="page.fields.heroCopy" />
  </Head>
  <div class="page-data">
    <breadcrumb :breadcrumb="breadcrumb" :title="title" />
    <page-hero class="py-24">
      <h1>{{ page.fields.page_title }}</h1>
      <!-- eslint-disable vue/no-v-html -->
      <!-- marked will sanitize the HTML injected -->
      <div v-html="parseMarkdown(page.fields.heroCopy)" />
      <NuxtLink to="/news-and-events/news">
        <el-button class="secondary mb-16">Browse All News &amp; Events</el-button>
      </NuxtLink>
      <template v-slot:image>
        <img v-if="page.fields.heroImage"class="page-hero-img news-and-events-hero-img" height="200px" width="200px"
          :src="page.fields.heroImage.fields.file.url" />
      </template>
      
    </page-hero>

    <div class="pt-32 pb-16">
      <div class="container">

        <el-row :gutter="32">
          <el-col class="mb-16" :sm="12">
            <div class="heading2 mb-16">Latest News</div>
            <div class="subpage news-wrap">
              <div>
                <news-list-item v-for="newsItem in news.items" :key="newsItem.sys.id" :item="newsItem" />

                <nuxt-link class="btn-load-more mt-16" :to="{
                    name: 'news-and-events-news'
                  }">
                  View All News
                </nuxt-link>
              </div>
            </div>
          </el-col>
          <el-col :sm="12">
            <div class="heading2 mb-16">Events</div>
            <div class="upcoming-events">
              <event-card v-for="event in upcomingEvents.items" :key="event.sys.id" :event="event" />
            </div>
            <div class="mt-16">
              <nuxt-link class="btn-load-more" :to="{
                  name: 'news-and-events-events',
                }">
                View All Events
              </nuxt-link>
            </div>
          </el-col>
        </el-row>

      </div>
    </div>
  </div>
</template>

<script>
import NewsListItem from '@/components/NewsListItem/NewsListItem.vue';
import EventCard from '@/components/EventCard/EventCard.vue';

import MarkedMixin from '@/mixins/marked'

import { fetchData, fetchNews } from './model';

export default {
  name: 'NewsAndEventPage',

  mixins: [
    MarkedMixin
  ],

  components: {
    NewsListItem,
    EventCard
  },

  async setup() {
    try {
      const { $contentfulClient } = useNuxtApp()
      const data = await fetchData($contentfulClient, '', 2)
      return data
    } catch(e) {
    }
  },

  mounted() {
    const xFeedScript = document.createElement('script')
    xFeedScript.setAttribute('src', 'https://platform.twitter.com/widgets.js')
    document.head.appendChild(xFeedScript)
  },

  watch: {
    '$route.query': {
      handler: async function() {
        const { $contentfulClient } = useNuxtApp()
        const { upcomingEvents, news, page } = await fetchData($contentfulClient, this.$route.query.search, 2)
        this.upcomingEvents = upcomingEvents;
        this.news = news;
        this.page = page;
      },
      immediate: true
    }
  },

  data: function() {
    return {
      title: 'News & Events',
      breadcrumb: [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        }
      ],
      upcomingEvents: {},
      news: {},
      page: {
        fields: {
          'page_title': 'News & Events'
        }
      }
    }
  },

  methods: {
    /**
     * Get all news
     */
    getAllNews: async function() {
      const { $contentfulClient } = useNuxtApp()
      const news = await fetchNews($contentfulClient, this.$route.query.search, undefined, undefined, undefined, undefined, this.news.total, 2)
      this.news = { ...this.news, items: { ...this.news.items, ...news.items } }
    },
    currentMonth() {
      return new Date().getMonth()
    }
  }
}
</script>

<style scoped lang="scss" >
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.page-data {
  background-color: $background;
}
.heading1 {
  font-weight: 300;
}
.subpage {
  margin: 0;
}
.event-card {
  margin-bottom: 2em;
}
.upcoming-events {
  justify-content: space-between;
  display: flex;
  flex-wrap: wrap;
}
.upcoming-event {
  margin: 0;
  width: 100%;
  @media (min-width: 48em) {
    width: calc(50% - 2.4rem); // Account for the margins and the border
  }
}
.news-list-item {
  border-bottom: 2px solid #d8d8d8;
  padding: 1.5em 0;
  &:first-child {
    padding-top: 0;
  }
}

.btn-load-more {
  background: none;
  border: none;
  color: $es-primary-color;
  cursor: pointer;
  display: block;
  font-size: 1rem;
  font-weight: 500;
  padding: 0;
  text-decoration: underline;
}

:deep(.el-button) {
  a {
    text-decoration: none !important;
  }
}

:deep(.campaign) {
   margin-top: .5rem; 
}

img.page-hero-img.news-and-events-hero-img{
  height: 200px;
  width: 200px;
}
</style>
