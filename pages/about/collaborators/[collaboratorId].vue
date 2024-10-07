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
      <div>parseMarkdown(heroCopy)</div>
    </page-hero>
    <div class="page-wrap container">
      <h2>More Information</h2>
      <div>parseMarkdown(aboutCollaborator)</div>
      <div class="contact-card-wrapper">
          <el-card 
          style="max-width: 480px">
            <template #header>
              <span>Contact Information</span>
            </template>
            <p>Wagenaar Lab</p>
            <p><span>Email :</span><a :href="collaboratorEmail">{{ collaboratorEmail }}</a></p>
          </el-card>
      </div>
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
      collaboratorEmail: '',
      breadcrumb: [
        {
          to: {
            name: 'index'
          },
          label: 'Home'
        },
        {
          to: {
            name: 'about'
          },
          label: 'About Epilepsy.science'
        },
        {
          to: {
            name: 'about'
          },
          label: 'Collaborators'
        },
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
.contact-card-wrapper {
  margin-top: 24px;
  span {
    font-weight: 600;
    margin-right: 12px;
  }
}
</style>
