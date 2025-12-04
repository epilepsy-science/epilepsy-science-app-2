<script setup lang="ts">
import { computed } from "vue";
import { getLicenseLink } from "~/utils/license-util";

const route = useRoute();
const runtimeConfig = useRuntimeConfig();

//  ==== VERSIONS ====
const versionsUrl = computed(() => {
  return `${runtimeConfig.public.discover_api_host}/datasets/${route.params.datasetId}/versions`;
});
const { data: versions } = await useFetch(versionsUrl, {});

// ==== GET DATASET DETAILS =====
const isTombStone = ref(false);
const datasetUrl = `${runtimeConfig.public.discover_api_host}/datasets/${route.params.datasetId}`;
const datasetFullUrl = computed(() => {
  return route.params.version
    ? `${datasetUrl}/versions/${route.params.version}`
    : datasetUrl;
});
const { data: dsDetails } = await useFetch(datasetFullUrl, {
  onResponseError({ request, response, options }) {
    if (response.status === 410) {
      const dataset = response.data;

      isTombStone.value = true;
      dsDetails.value = dataset;
    }
  },
});

// ==== Dataset Use Agreement ====
const hasAgreement = ref(false);
const agreementUrl = `${runtimeConfig.public.discover_api_host}/datasets/${route.params.datasetId}/data-use-agreement`;
const { data: dataUseAgreement } = await useFetch(agreementUrl, {
  onResponse({ response }) {
    hasAgreement.value = response.status === 200;
  },
});

// ---- README ----
const { data: markDown } = await useFetch(dsDetails?.value?.readme, {
  headers: { "Content-type": "text" },
});

// ---- Tags ----
const tagsUrl = computed(() => {
  return `${runtimeConfig.public.discover_api_host}/tags`;
});
const { data: tags } = await useFetch(tagsUrl, {});

// ==== SEO HEAD ====
const seoTitle = computed(() => {
  return `${dsDetails.value?.name} - Pennsieve Discover`;
});

function getSEOLicense(licenseString) {
  try {
    return getLicenseLink(licenseString);
  } catch {
    return "";
  }
}

function getCreatorsAndOrgMap() {
  if (Object.keys(dsDetails.value).length > 0) {
    let creators = dsDetails.value.contributors.map((contributor) => {
      const sameAs = contributor.orcid
        ? `http://orcid.org/${contributor.orcid}`
        : null;
      return {
        "@type": "Person",
        sameAs,
        givenName: contributor.firstName,
        familyName: contributor.lastName,
        name: `${contributor.firstName} ${contributor.lastName}`,
      };
    });

    return creators.concat({
      "@type": "Organization",
      name: dsDetails.value.organizationName,
    });
  }
  return [];
}

function getSEOUrl() {
  if (window) {
    return new URL(
      route.href,
      window.location.origin + window.location.pathname
    ).href;
  } else {
    return "";
  }
}

useHead({
  title: () => `Pennsieve: ${dsDetails.value.name}`,
  meta: () => [
    { name: "description", content: dsDetails.value.datasetDescription },
    { name: "DC.creator", content: JSON.stringify(getCreatorsAndOrgMap()) },
    { name: "DC.publisher", content: dsDetails.value.organizationName },
    {
      name: "DC.date",
      content: useFormatDate(dsDetails.value.firstPublishedAt),
      scheme: "DCTERMS.W3CDTF",
    },
    { name: "DC.version", content: dsDetails.value.version },
    {
      name: "DC.identifier",
      content: `https://doi.org/${dsDetails.value.doi}`,
      scheme: "DCTERMS.URI",
    },
    { property: "og:url", content: getSEOUrl() },
    { name: "DC.type", content: "Dataset" },
    { name: "DC.description", content: dsDetails.value.datasetDescription },
    {
      name: "DCTERMS.license",
      content: getSEOLicense(dsDetails.value.license),
    },
    { property: "og:type", content: "website" },
    { property: "og:title", content: seoTitle },
    { property: "og:description", content: dsDetails.value.datasetDescription },
    { property: "og:image", content: dsDetails.value.banner },
    {
      property: "og:image:alt",
      content: `${dsDetails.value.name} Banner Image`,
    },
    { property: "og:site_name", content: "Pennsieve Discover" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:site", content: "@pennsieve1" },
    { name: "twitter:creator", content: dsDetails.value.organizationName },
    {
      name: "twitter:description",
      content: dsDetails.value.datasetDescription,
    },
    { name: "twitter:image", content: dsDetails.value.banner },
  ],
  script: () => [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Dataset",
        "@id": `https://doi.org/${dsDetails.value.doi}`,
        name: dsDetails.value.name,
        description: dsDetails.value.description,
        url: getSEOUrl(),
        identifier: `https://doi.org/${dsDetails.value.doi}`,
        license: getSEOLicense(dsDetails.value.license),
        isAccessibleForFree: true,
        creator: getCreatorsAndOrgMap(),
        datePublished: dsDetails.value.versionPublishedAt,
        dateModified: dsDetails.value.lastUpdatedDate,
        version: dsDetails.value.version,
        // citation: this.citationText,  // Is populated in datasetDetails
      }),
    },
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        url: `${runtimeConfig.public.siteUrl}`,
        name: "Pennsieve Discover",
      }),
    },
  ],
});

// ---- Dataset Details ----
</script>

<template>
  <div class="dataset-details">
    <dataset-details
      v-if="isTombStone === false"
      :dataset-details="dsDetails"
      :versions="versions"
      :markdown="markDown"
      :has-agreement="hasAgreement"
      :data-use-agreement="dataUseAgreement"
    />

    <dataset-tombstone
      v-else
      :tags="tags"
      :dataset-details="dsDetails"
      :versions="versions"
    />
  </div>
</template>

<style scoped lang="scss">
.dataset-details {
  border-top: 1px solid $gray_1;
}
</style>
