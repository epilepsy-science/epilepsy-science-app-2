<template>
  <NuxtLayout>
    <div class="nuxt-error">
      <component :is="errorPage" :error="error" />
    </div>
  </NuxtLayout>
</template>
<script>
import error404 from "~/components/Error/Error404.vue";
import error400 from "~/components/Error/Error400.vue";
export default {
  name: "ErrorPage",
  props: {
    error: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    errorPage() {
      if (this.error.statusCode === 404) {
        return error404;
      }
      // catch everything else
      return error400;
    },
  },
};
</script>
