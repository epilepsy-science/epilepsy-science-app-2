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
      <h2>More Information</h2>
      <div v-html="parseMarkdown(aboutCollaborator)"></div>
      <div class="contact-card-wrapper">
        <el-card style="max-width: 480px">
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

<script setup>
import { ref, computed } from 'vue';
import { useRuntimeConfig, useNuxtApp, useAsyncData } from '#app';
import marked from '@/mixins/marked';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';

const config = useRuntimeConfig();
const { $contentfulClient } = useNuxtApp();

const breadcrumb = ref([
  {
    to: { name: 'index' },
    label: 'Home',
  },
  {
    to: { name: 'about' },
    label: 'About Epilepsy.science',
  },
  {
    to: { name: 'about' },
    label: 'Collaborators',
  },
]);

const { data, error } = await useAsyncData('pageData', async () => {
  try {
    const [header, details] = await Promise.all([
      $contentfulClient
        .getEntry(config.public.ctf_pedquest_about_page_id)
        .then(({ fields }) => ({ ...fields })),
      $contentfulClient
        .getEntry(config.public.ctf_pedquest_collaborator_details)
        .then(({ fields }) => ({ ...fields })),
    ]);

    return { ...header, ...details };
  } catch (err) {
    console.error('Could not fetch page data from Contentful.', err);
    throw err;
  }
});

const heroCopy = computed(() => data.value?.heroCopy || '');
const aboutCollaborator = computed(() => data.value?.aboutCollaborator || '');
const collaboratorEmail = computed(() => data.value?.collaboratorEmail || '');
const pageTitle = computed(() => data.value?.pageTitle || 'Collaborator Details');

const parseMarkdown = marked.methods.parseMarkdown;
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