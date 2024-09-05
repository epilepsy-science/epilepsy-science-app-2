<template>
  <div class="page-data">
    <page-hero>
      <h1 v-if="heroHeading">
        {{ heroHeading }}
      </h1>
      <!-- eslint-disable vue/no-v-html -->
      <!-- marked will sanitize the HTML injected -->
      <div v-html="parseMarkdown(heroCopy)" />
      <template v-slot:image>
        <img
          v-if="heroImage"
          class="page-hero-img"
          :src="heroImage.fields?.file.url"
        />
      </template>
    </page-hero>
    <hr />
    <portal-features :features="portalFeatures" />
    <hr />
    <div class="secondary-background">
      <homepage-news :news="newsAndEvents" />
    </div>
    <hr />
    <stay-connected />
    <hr />
  </div>
</template>

<script>
import HomepageNews from '@/components/HomepageNews/HomepageNews.vue'
import PortalFeatures from '@/components/PortalFeatures/PortalFeatures.vue'
import StayConnected from '@/components/StayConnected/StayConnected.vue'

import marked from '@/mixins/marked/index'
import getHomepageFields from '@/utils/homepageFields'
import { useMainStore } from '../store/index.js'
import { mapState } from 'pinia'
import { clone } from 'ramda'

export default {
  name: 'EpilepsyScienceHomepage',

  components: {
    HomepageNews,
    PortalFeatures,
    StayConnected
  },

  mixins: [marked],

  async setup() {
    const config = useRuntimeConfig()
    const { $contentfulClient } = useNuxtApp()
    useHead({
      title: 'Epilepsy.Science - Advancing Epilepsy Research Worldwide',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'Advancing Epilepsy Research through Open Science'
        },
        {
          name: 'og:type',
          content: 'website'
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: 'Epilepsy.Science'
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: 'https://images.ctfassets.net/erzgaqq17mnz/46BUPtc8c1AJXcI8kpHrN4/8b2a49b4f55525c675330c6f4c9a55a9/epilepsy.science.png'
        },
        {
          hid: 'og:image:secure_url', property: 'og:image:secure_url',
          content: 'https://images.ctfassets.net/erzgaqq17mnz/46BUPtc8c1AJXcI8kpHrN4/8b2a49b4f55525c675330c6f4c9a55a9/epilepsy.science.png'
        },
        {
          name: 'og:site_name',
          content: 'Epilepsy.Science'
        },
        {
          name: 'twitter:card',
          content: 'summary'
        },
        {
          name: 'twitter:site',
          content: '@epilepsy_science'
        },
        {
          name: 'twitter:title',
          content: 'Epilepsy Science Portal'
        },
        {
          name: 'twitter:image',
          content: 'https://images.ctfassets.net/erzgaqq17mnz/46BUPtc8c1AJXcI8kpHrN4/8b2a49b4f55525c675330c6f4c9a55a9/epilepsy.science.png'
        },
        {
          name: 'twitter:description',
          content: 'Advancing Epilepsy Research through Open Science'
        }
      ]
    })
    return Promise.all([
      $contentfulClient.getEntry(config.public.ctf_home_page_id)
    ]).then(async ([homepage]) => {
      let fields = getHomepageFields(homepage.fields)
      return fields
    }).catch(e => {
      console.error(e);
      return { contentfulError: true }
    })
  },
  
  watch: {
    profileComplete: {
      handler: function () {
        if (this.userProfile && !this.profileComplete) {
          this.$router.push("/welcome")
        }
      },
      immediate: true
    },
  },

  computed: {
    ...mapState(useMainStore, ['profileComplete', 'userProfile']),
  },

  beforeMount() {
    // When trying to do federated sign in using a middleware (like we do for sign out), Cognito's callback would only
    // execute client-side (after the middleware had already redirected to the new page) causing it to overwrite the 
    // previous redirect. This issue was supposed to be addressed by https://github.com/aws-amplify/amplify-js/pull/3588, 
    // but attempting to handle dynamic routing after amplify federated sign in via a custom state hook as suggested 
    // here: https://github.com/aws-amplify/amplify-js/issues/3125#issuecomment-814265328 did not work
    const signInRedirectCookie = useCookie('sign-in-redirect-url')
    if (signInRedirectCookie.value != null) {
      const signInRedirectUrl = clone(signInRedirectCookie.value)
      signInRedirectCookie.value = null
      return navigateTo(signInRedirectUrl)
    }
  },

  data: () => {
    return {
      featuredData: [],
      exploreData: [],
      newsAndEvents: [],
      portalFeatures: [],
      heroCopy: '',
      heroHeading: '',
      heroImage: {}
    }
  },
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.page-data {
  background-color: #f8faff;
}
.secondary-background {
  background-color: $background;
}
.page-hero-video {
  width: 406px;
}

hr {
  margin: 0;
  padding: 0;
  border-top: none;
  border-color: $lineColor1;
}
</style>
