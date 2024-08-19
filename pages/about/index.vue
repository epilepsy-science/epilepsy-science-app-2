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
    <div class="page-wrap container">
      <h3>What are we doing here at Epilepsy.Science?</h3>

      <p>
        Epilepsy.Science is a new cloud-based platform for managing, analyzing,
        publishing, and sharing scientific datasets to accelerate epilepsy
        research. Led by PennSieve and the Brain Data Science Platform (BDSP)
        and with support from the AWS Open Data Sponsorship Program, we are
        creating an unparalleled open data resource for the epilepsy community.
      </p>

      <p>
        The mission of Epilepsy.Science is to drive progress in understanding,
        treating, and ultimately curing epilepsy through open access to
        multidimensional epilepsy data at scale. The platform provides over
        200,000 EEG recordings from diverse contexts including routine
        outpatient EEGs, critically ill patients, and epilepsy monitoring unit
        evaluations. As it grows, it will also include extensive accompanying
        clinical data like medications, imaging, genetics, and more from
        institutions worldwide.
      </p>

      <p>
        Researchers can use Epilepsy.Science to easily build customized cohorts
        by connecting data points across datasets. The platform enables
        scientists to publish -- at no cost -- high quality datasets for
        citation, reuse, and reproducible research. By promoting open science,
        Epilepsy.Science aims to accelerate discoveries and improve patient
        outcomes.
      </p>

      <p>This collaboration brings together:</p>

      <ul>
        <li>
          Pennsieve’s scalable data management and sharing capabilities and
          graph-based data integration model.
        </li>

        <li>
          BDSP’s extensive data resources including over 200,000 EEG recordings
          and genetics, imaging, and clinical data. BDSP also contributes a
          library of open-source analytics tools.
        </li>

        <li>
          The AWS Open Data Sponsorship Program covers the cost of storage for
          publicly available high-value cloud-optimized datasets. We work with
          data providers who seek to democratize access to data by making it
          available for analysis on AWS, develop new cloud-native techniques,
          formats, and tools that lower the cost of working with data, and
          encourage the development of communities that benefit from access to
          shared datasets.
        </li>
      </ul>

      <p>
        Epilepsy.Science offers unprecedented opportunities for open,
        collaborative epilepsy research through its powerful data resources,
        analytics tools, and cloud-based platform.
      </p>
    </div>
  </div>
</template>

<script>
import marked from '@/mixins/marked';

export default {
  name: 'AboutPage',

  mixins: [marked],

  data: () => {
    return {
      heroCopy: '',
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
</style>