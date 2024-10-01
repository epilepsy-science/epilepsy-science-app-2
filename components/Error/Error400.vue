<template>
  <div class="error-400">
    <div class="container">
      <div class="subpage">
        <!-- only display custom message if it is available -->
        <p v-if="error?.message">
          {{ error.message }}
        </p>
        <p>
          One of our external resources is down. This part of the site is not
          accessible. Please come back later.
        </p>
        <p>
          Please reach out to <a href="mailto:support@pennsieve.io">support@pennsieve.io</a> if the issue persists.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error400Page',
  props: ['error']
}
</script>
