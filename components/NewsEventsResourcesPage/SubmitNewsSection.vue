<template>
  <paper
    :text="parseMarkdown(searchPaperText)"
    :button-text="searchPaperNEButton"
    new-tab
  />
</template>

<script>
import Paper from '@/components/Paper/Paper.vue'
import marked from '@/mixins/marked/index'

export default {
  name: 'SubmitNewsSection',

  mixins: [marked],

  components: {
    Paper
  },

  async setup() {
    const config = useRuntimeConfig()
    const { $contentfulClient } = useNuxtApp()
    const response = await $contentfulClient.getEntry(config.public.ctf_news_and_events_page_id)
    const searchPaperNEButton = response.fields.searchPaperNeButton
    const searchPaperText = response.fields.searchPaperText
    return {
      searchPaperNEButton,
      searchPaperText
    }
  }
}
</script>
