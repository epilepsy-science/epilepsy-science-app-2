<template>
  <client-only>
    <content-loader
      :height="171"
      :width="968"
      :speed="2"
      primary-color="#f3f3f3"
      secondary-color="#ecebeb"
    >
      <rect x="14.39" y="24" rx="0" ry="0" width="121.59" height="126.54" />
      <rect x="158" y="25" rx="0" ry="0" width="789.8" height="32.12" />
      <rect x="157" y="73" rx="0" ry="0" width="791.17" height="38" />
      <rect x="160" y="126" rx="0" ry="0" width="788.63" height="22.42" />
    </content-loader>
  </client-only>

</template>

<script>
import { ContentLoader } from 'vue-content-loader'

export default {
  name: 'DatasetListItemLoader',

  components: {
    ContentLoader
  }
}
</script>
