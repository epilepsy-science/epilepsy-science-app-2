<script setup>
const nuxtApp = useNuxtApp()

const props = defineProps({
  publication: {type: Object, default:{}},
})


// ---- CITATION ----
const citationUrl = computed(() => {return `https://doi.org/${props.publication.doi}`})
const { data:citation } = await useLazyFetch(citationUrl, {
  query:{
    style: 'apa'
  },
  headers: {
   'Accept':'text/x-bibliography',
  }
})



</script>

<template>
  <div class="external-publication-list-item">
    <p v-if="citation" class="mb-0" v-html="citation" />
  </div>
</template>


<style lang="scss" scoped>
.external-publication-list-item {
  color: #cfdbfc;
}
</style>
