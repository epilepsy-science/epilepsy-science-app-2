<template>
  <div class="error-404">
    <div class="container">
      <div class="subpage">
        <h1>This page does not exist</h1>
        <br />
        <!-- only display custom message if it is available -->
        <p v-if="error?.message">
          {{ error.message }}
        </p>
        <p>
          The link you clicked on may be broken or no longer exist. Click
          <a href="/">here</a> to go back to home page.
        </p>
        <p>
          Please reach out to
          <a href="mailto:support@pennsieve.io">support@pennsieve.io</a> if this
          page should exist.
        </p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Error404Page",
  props: {
    error: {
      type: Object,
      default: () => {},
    },
  },
};
</script>
<style>
.error-404 a {
  cursor: pointer;
}
</style>
