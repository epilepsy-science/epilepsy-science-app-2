// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from "pathe";

export default defineNuxtConfig({
  app: {
    head: {
      title: "Epilepsy.Science - Advancing Epilepsy Research Worldwide",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content: "Progressing Epilepsy research around the globe",
        },
        {
          hid: "keywords",
          name: "keywords",
          content:
            "Epilepsy, University of Pennsylvania, Harvard University, University of Pennsylvania Hospital, Massachusetts General Hospital",
        },
        // default social cards information for site sharing url's
        { hid: "og:type", property: "og:type", content: "website" },
        { hid: "og:title", property: "og:title", content: "Epilepsy.Science" },
        {
          hid: "og:description",
          property: "og:description",
          content: "Advancing Epilepsy Research through Open Science",
        },
        {
          hid: "og:image",
          property: "og:image",
          content:
            "http://images.ctfassets.net/erzgaqq17mnz/46BUPtc8c1AJXcI8kpHrN4/8b2a49b4f55525c675330c6f4c9a55a9/epilepsy.science.png",
        },
        {
          hid: "og:image:secure_url",
          property: "og:image:secure_url",
          content:
            "http://images.ctfassets.net/erzgaqq17mnz/46BUPtc8c1AJXcI8kpHrN4/8b2a49b4f55525c675330c6f4c9a55a9/epilepsy.science.png",
        },
        {
          hid: "og:url",
          property: "og:url",
          content: process.env.ROOT_URL || "https://epilepsy.science",
        },
        { hid: "t-type", name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@epilepsy_science" },
        { name: "twitter:title", content: "Epilepsy.Science" },
        {
          name: "twitter:image",
          content:
            "http://images.ctfassets.net/erzgaqq17mnz/46BUPtc8c1AJXcI8kpHrN4/8b2a49b4f55525c675330c6f4c9a55a9/epilepsy.science.png",
        },
        {
          name: "twitter:description",
          content: "Advancing Epilepsy Research through Open Science",
        },
        {
          hid: "google-site-verification",
          name: "google-site-verification",
          content: "wim-FZOyN17pJet9TA8sQYZ-J6iMg1unI5YtANDP6sg",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css?family=Asap:400,400i,500,600,700&display=swap",
        },
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap' 
        },
      ]
    },
  },
  devtools: { enabled: true },
  modules: [
    "@element-plus/nuxt",
    "nuxt-svgo",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/sitemap",
  ],
  vite: {
    define: {
      "window.global": {},
    },
    css: {
      preprocessorOptions: {
        scss: { // Add partials under this
          api: "modern-compiler",
          additionalData: '@use "@/assets/scss/_variables.scss" as *;',
        },
      },
    },
  },
  routeRules: {
    "/resources": { redirect: "/tools-and-resources/tools" },
    "/tools-and-resources": { redirect: "/tools-and-resources/tools" },
    "/resources/biological": {
      redirect: "/tools-and-resources/tools?resourceType=Biological",
    },
    "/resources/databases": {
      redirect: "/tools-and-resources/tools?resourceType=Data+and+Models",
    },
    "/resources/devices": {
      redirect: "/tools-and-resources/tools?resourceType=Devices",
    },
    "/resources/information-services": {
      redirect: "/tools-and-resources/tools?resourceType=Information+Services",
    },
    "/resources/software": {
      redirect: "/tools-and-resources/tools?resourceType=Software",
    },
  },
  hooks: {
    "pages:extend"(pages) {
      pages.push(
        {
          name: "version",
          path: "/datasets/:datasetId/version/:version",
          file: resolve("./pages/datasets/[datasetId].vue"),
        },
        {
          name: "tools",
          path: "/tools-and-resources/tools",
          file: resolve("./components/Resources/ResourcePage.vue"),
        },
        {
          name: "resources",
          path: "/tools-and-resources/resources",
          file: resolve("./components/Resources/ResourcePage.vue"),
        }
      );
    },
  },
  runtimeConfig: {
    public: {
      discover_api_host:
        process.env.PENNSIEVE_DISCOVER_API_HOST ||
        "https://api.pennsieve.io/discover",
      zipit_api_host:
        process.env.ZIPIT_API_HOST || "https://api.pennsieve.io/zipit/discover",
      CTF_SPACE_ID: process.env.CTF_SPACE_ID,
      CTF_CDA_ACCESS_TOKEN: process.env.CTF_CDA_ACCESS_TOKEN,
      CTF_API_HOST: process.env.CTF_API_HOST || "preview.contentful.com",
      ctf_home_page_id: "4KuOw0SnxWqN7SZ6W68oey",
      ctf_portal_notification_entry_id: "1kGepfPts4FM3tDfOGVPnQ",
      ctf_about_page_id: "eGyEJR9pBdNT4zI71Y6sD",
      ctf_news_id: "news",
      ctf_event_id: "event",
      ctf_resource_id: "epilepsyResource",
      ctf_news_and_events_page_id: "27g94v7HnxrqsCKKA8Wf7o",
      ctf_tools_and_resources_page_id: "5gOQBmYpDBRPtJh7Yzj8SP",
      ctf_consortia_content_type_id: "consortia",
      ctf_pedquest_about_page_id: "2GgKi7i5bruGNdLTrIBV7t",
      ctf_pedquest_collaborator_details: "1tbeLijAKo4toaZoyOLkTu",
      portal_api:
        process.env.PORTAL_API_HOST || "https://sparc-api.herokuapp.com",
      DEPLOY_ENV: process.env.DEPLOY_ENV || "development",
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY,
      ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
      ALGOLIA_INDEX: process.env.ALGOLIA_INDEX || "epilepsy_science_index",
      ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_DESC:
        process.env.ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_DESC ||
        "epilepsy_science_index",
      ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_ASC:
        process.env.ALGOLIA_INDEX_VERSION_PUBLISHED_TIME_ASC ||
        "epilepsy_science_index",
      ALGOLIA_INDEX_PUBLISHED_TIME_DESC:
        process.env.ALGOLIA_INDEX_PUBLISHED_TIME_DESC ||
        "epilepsy_science_index",
      ALGOLIA_INDEX_PUBLISHED_TIME_ASC:
        process.env.ALGOLIA_INDEX_PUBLISHED_TIME_ASC ||
        "epilepsy_science_index",
      ALGOLIA_INDEX_ALPHABETICAL_A_Z:
        process.env.ALGOLIA_INDEX_ALPHABETICAL_A_Z || "epilepsy_science_index",
      ALGOLIA_INDEX_ALPHABETICAL_Z_A:
        process.env.ALGOLIA_INDEX_ALPHABETICAL_Z_A || "epilepsy_science_index",
      AWS_REGION: process.env.AWS_REGION || "us-east-1",
      AWS_USER_POOL_ID: process.env.AWS_USER_POOL_ID || "us-east-1_FVLhJ7CQA",
      AWS_USER_POOL_WEB_CLIENT_ID:
        process.env.AWS_USER_POOL_WEB_CLIENT_ID || "",
      AWS_USER_AUTHENTICATION_FLOW_TYPE:
        process.env.AWS_USER_AUTHENTICATION_FLOW_TYPE || "USER_PASSWORD_AUTH",
      AWS_OAUTH_DOMAIN:
        process.env.AWS_OAUTH_DOMAIN ||
        "pennsieve-dev-users2.auth.us-east-1.amazoncognito.com",
      AWS_OAUTH_SCOPE: process.env.AWS_OAUTH_SCOPE || "openid",
      AWS_OAUTH_RESPONSE_TYPE: process.env.AWS_OAUTH_RESPONSE_TYPE || "token",
      AWS_OAUTH_REDIRECT_SIGN_IN_URL:
        process.env.AWS_OAUTH_REDIRECT_SIGN_IN_URL || "http://localhost:3000",
      AWS_OAUTH_REDIRECT_SIGN_OUT_URL:
        process.env.AWS_OAUTH_REDIRECT_SIGN_OUT_URL || "http://localhost:3000",
      LOGIN_API_URL: process.env.LOGIN_API_URL || "https://api.pennsieve.net",
      PENNSIEVE_API_VERSION_2:
        process.env.PENNSIEVE_API_VERSION_2 || "https://api2.pennsieve.net",
      SHOW_TIMESERIES_VIEWER: process.env.SHOW_TIMESERIES_VIEWER || "false",
      ORCID_API_URL: process.env.ORCID_API_URL || "https://pub.orcid.org/v2.1",
      crosscite_api_host:
        process.env.CROSSCITE_API_HOST || "https://citation.crosscite.org",
      max_download_size: parseInt(
        process.env.MAX_DOWNLOAD_SIZE || "5000000000"
      ),
      MBF_SPARC_API: process.env.MBF_SPARC_API || "https://mbfsparcapi.com",
      BL_SERVER_URL: "https://sparc.biolucida.net",
      BL_SHARE_LINK_PREFIX: "https://sparc.biolucida.net/image?c=",
      ROOT_URL: process.env.ROOT_URL || "https://epilepsy.science",
      METRICS_URL:
        process.env.METRICS_URL || "https://metrics.epilepsy.science",
      BITLY_ACCESS_TOKEN: process.env.BITLY_ACCESS_TOKEN,
      bitly_expand_endpoint: "https://api-ssl.bitly.com/v4/expand",
      INTERNAL_TRAFFIC_KEY:
        process.env.INTERNAL_TRAFFIC_KEY || "internal_traffic",
      INTERNAL_TRAFFIC_VALUE: process.env.INTERNAL_TRAFFIC_VALUE || "internal",
    },
  },
  /*
   ** Add global CSS styles under this
   */
  css: [
    "sparc-design-system-components-2/dist/style.css",
    "@/assets/base.scss",
    "@/assets/design-system-overrides.scss",
    "@/assets/new-design-base.scss",
    "@/assets/viewer.scss",
    "@/assets/element-ui-accordion-overrides.scss"
  ],
  sitemap: {
    xslColumns: [{ label: "URL", width: "100%" }],
  },
  sourcemap: {
    server: false,
    client: false
  }
});
