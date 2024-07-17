<template>
  <Head>
    <Title>{{ pageTitle }}</Title>
    <Meta name="og:title" hid="og:title" :content="pageTitle" />
    <Meta name="twitter:title" :content="pageTitle" />
    <Meta name="description" hid="description" :content="heroCopy" />
    <Meta name="og:description" hid="og:description" :content="heroCopy" />
    <Meta name="twitter:description" :content="heroCopy" />
  </Head>
  <div class="about-page pb-16">
    <breadcrumb :breadcrumb="breadcrumb" title="About" />
    <page-hero class="py-24" v-if="heroCopy">
      <h1>{{ pageTitle }}</h1>
      <div v-html="parseMarkdown(heroCopy)" />
    </page-hero>
    <div class="container">
      <paper class="row mt-32" :text="parseMarkdown(sparcPortal)" button-text="View The Roadmap"
        button-link-external="https://docs.sparc.science/docs/sparc-portal-roadmap" />
    </div>
  </div>
</template>

<script>
import Paper from '~/components/Paper/Paper.vue'
import Gallery from '~/components/Gallery/Gallery.vue'

import marked from '@/mixins/marked'
import { pathOr } from 'ramda'

export default {
  name: 'AboutPage',

  components: {
    Paper,
    Gallery
  },

  mixins: [marked],

  data: () => {
    const config = useRuntimeConfig()
    return {
      heroCopy: '',
      copy: '',
      breadcrumb: [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        }
      ],
      projectId: config.public.ctf_project_id,
      heroImage: {},
      futurePlans: '',
      aboutPortalPageId: config.public.ctf_about_portal_page_id,
      contentfulError: false
    }
  },

  setup() {
    const config = useRuntimeConfig()
    const { $contentfulClient } = useNuxtApp()
    return Promise.all([
      /**
       * Page data
       */
      $contentfulClient
        .getEntry(config.public.ctf_about_page_id)
        .then(({fields}) => {
          return fields
        })
        .catch(err => console.error('Could not fetch page data from Contentful.', err)),
    ]).then(([cfPage]) => ({
      ...cfPage
    }))
  }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.about-page {
  background-color: $background;
}

.row {
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 767px) {
    flex-direction: column;
  }
}
</style>
