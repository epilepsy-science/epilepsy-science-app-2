<script setup>
import {useMainStore} from '~/store/index.js'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const store = useMainStore()

const PackageFilesUrl = computed(() => {
  return `${runtimeConfig.public.discover_api_host}/packages/${route.params.id}/files`
})

onMounted((to, from) => {
  if (route.params.id !== 'details') {
    getPackageFiles(PackageFilesUrl)
  }
})

const packageFiles = ref([])
const packageType = ref('')


function getPackageFiles(url) {

  // Only do this if there is a packageSourceId
  return useSendXhr(PackageFilesUrl.value, {
    header: {},
    method: 'GET',
  }).then((response) => {
    packageFiles.value = response
  }).then( () => {
    if (packageFiles.value.files.length > 0) {
      // Get DatasetId and version from first file in package
      const expr = /s3:\/\/[a-z-0-9]+\/([0-9]+)\/(.*)/
      const match = packageFiles.value.files[0].uri.match(expr)
      const datasetId = match[1]
      store.setSelectedPackage({
        datasetId: datasetId,
        version: 1,
        files: packageFiles.value.files})
    }

    packageType.value = packageFiles.value.files[0].packageType


  }).catch((error) => {
    console.log('An error occurred getting the files for the package.')
  })
}

</script>

<template>
  <div class="package-details">

    <package-details
      class="package-details-content"
    />
<!--    <pennsieve-viewer-->
<!--      class="pennsieve-viewer"-->
<!--      :pkg="sourcePackage"-->
<!--      :pkgType="packageType"-->
<!--    />-->

    <!--    <bf-footer />-->
  </div>
</template>

<style lang="scss" scoped>

.package-details {
  display:flex;
  flex-direction: column;
}

.package-details-content  {
}

.pennsieve-viewer {
  display: flex;
}

</style>
