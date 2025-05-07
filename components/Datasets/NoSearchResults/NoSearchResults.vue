<template>
  <div class="no-search-results">
    <img
      class="mb-32"
      src="../../../../assets/images/illustrations/illo-search.svg"
      height="80"
      width="100"
      alt="Illustration of a magnifying glass"
    />
    <h2 class="mb-8">
      No results <template v-if="searchQuery">for “{{ searchQuery }}”</template>
    </h2>
    <p class="mb-40">
      That filter/search combination has no results. Please try an alternate
      search.
    </p>
    <bf-button @click="$emit('back')">
      Back to All Datasets
    </bf-button>
  </div>
</template>

<script>
import BfButton from '~/components/Shared/BfButton/BfButton.vue'

export default {
  name: 'NoSearchResults',

  components: {
    BfButton
  },

  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.no-search-results {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 10px;
}
p {
  margin-bottom: 27px;
}
</style>
