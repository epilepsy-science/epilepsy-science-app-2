<script setup>
import { propOr } from 'ramda'

const props = defineProps({
  currentVersion: {
    type: Number,
    default: 1
  },
  datasetDetails: {
    type: Object,
    default: () => {}
  },
  isTombStone: {
    type: Boolean,
    default: false
  }

})

/**
 * Copy to show in the message
 * depeneding on whether the user is
 * on the tombstone page or not
 * @returns {String}
 */
const messageCopy = computed(() => {
  return props.isTombStone ? 'You are attempting to view' : 'You are viewing'
})

/**
 * Get formatted embargoed date
 * @return {String}
 */
const embargoedReleaseDate = computed(()=> {
  const date = propOr('', 'embargoReleaseDate', props.datasetDetails)
  return useFormatCalendarDate(date)
})

</script>

<template>
  <div
    :class="
      datasetDetails.embargo ? 'version-message-fixed' : 'version-message'
    "
    class="el-message el-message--info"
  >
    <p v-if="!datasetDetails.embargo" class="el-message__content">
      {{ messageCopy }} version {{ currentVersion }} of this dataset. A
      <nuxt-link
        :to="{
          name: 'datasets-id',
          params: {
            id: datasetDetails.id
          }
        }"
      >
        more recent version
      </nuxt-link>
      is available.
    </p>
    <p v-else class="el-message__content">
      This dataset is under embargo and will be made publicly available on
      {{ embargoedReleaseDate }}
    </p>
  </div>
</template>

<style lang="scss" scoped>

.version-message {
  position: absolute;
  top: 72px;
  left: 50%;
  width: 550px;
}
a {
  // Removes the underlined space at the end
  // of the nuxt link to the latest version
  display: inline-block;
}

.version-message-fixed {
  box-sizing: border-box;
  top: 72px;
  max-width: 600px;
  width: 100%;
}
</style>