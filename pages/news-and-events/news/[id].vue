<template>
  <Head>
    <Title>{{ page.fields.title }}</Title>
    <Meta name="og:title" hid="og:title" :content="page.fields.title" />
    <Meta name="twitter:title" :content="page.fields.title" />
    <Meta name="description" hid="description" :content="page.fields.summary" />
    <Meta name="og:description" hid="og:description" :content="page.fields.summary" />
    <Meta name="twitter:description" :content="page.fields.summary" />
  </Head>
  <news-events-resources-page
    :page="page"
    :content="page.fields.copy"
    :breadcrumb="breadcrumb"
    :hero-title="page.fields.title"
    :hero-summary="page.fields.summary"
    type="news"
  >
    <template v-if="newsImage">
      <img :src="newsImage" :alt="newsImageAlt" />
      <hr />
    </template>

    <h3>Published Date</h3>
    <p>{{ publishedDate }}</p>

    <h3 v-if="page.fields.url">External Link</h3>
    <p v-if="page.fields.url">
      <a :href="page.fields.url" target="_blank">
        {{ page.fields.url }}
      </a>
    </p>
  </news-events-resources-page>
</template>

<script>
import { pathOr } from 'ramda'
import NewsEventsResourcesPage from '@/components/NewsEventsResourcesPage/NewsEventsResourcesPage'
import FormatDate from '@/mixins/format-date'

export default {
  name: 'NewsPage',

  components: {
    NewsEventsResourcesPage
  },

  mixins: [FormatDate],

  async setup() {
    const { $contentfulClient } = useNuxtApp()
    const route = useRoute()
    try {
      const page = await $contentfulClient.getEntry(route.params.datasetId)
      return { page }
    } catch (error) {
      return {
        page: {
          fields: []
        }
      }
    }
  },

  data() {
    return {
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
  computed: {
    /**
     * Get news and event image
     * @returns {String}
     */
    newsImage: function() {
      return pathOr('', ['fields', 'image', 'fields', 'file', 'url'], this.page)
    },

    /**
     * Get news and event image alt tag
     * @returns {String}
     */
    newsImageAlt: function() {
      return pathOr('', ['fields', 'image', 'fields', 'title'], this.page)
    },

    /**
     * Compute and formate start date
     * @returns {String}
     */
    publishedDate: function() {
      return this.page.fields.publishedDate
        ? this.formatDate(this.page.fields.publishedDate)
        : ''
    }
  }
}
</script>
