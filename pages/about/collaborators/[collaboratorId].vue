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
    <breadcrumb :breadcrumb="breadcrumb" title="PedQuEST" />
    <page-hero class="py-24" v-if="heroCopy">
      <h1>{{ pageTitle }}</h1>
      <div v-html="parseMarkdown(heroCopy)"></div>
    </page-hero>
    <div class="page-wrap container">
      <h2>{{ collaboratorName }}</h2>
      <div v-html="parseMarkdown(aboutCollaborator)"></div>

    </div>
  </div>
</template>
<script>
import marked from '@/mixins/marked';

export default {
  name: 'CollaboratorDetails',

  mixins: [marked],

  data: () => {
    return {
      heroCopy: '',
      aboutCollaborator: '',
      collaboratorName: '',
      breadcrumb: [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        }
      ],
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
        .getEntry(config.public.ctf_pedquest_about_page_id)
        .then(({fields}) => {
          return {...fields}
        })
        .catch(err => console.error('Could not fetch page data from Contentful.', err)),
        $contentfulClient
        .getEntry(config.public.ctf_pedquest_collaborator_details)
        .then(({fields}) => {
          console.log('fields', fields)
          return {...fields}
        })
        .catch(err => console.error('Could not fetch page data from Contentful.', err)),
    ]).then(([header, details]) => {
      return ({
      ...header, ...details
    })
    })
  }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.about-page {
  background-color: $background;
}
</style>