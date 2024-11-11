<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-section">
        <h3 class="footer-title">Site Pages.</h3>
        <ul>
          <li><nuxt-link to="/data">Data & Models</nuxt-link></li>
          <li><nuxt-link to="/about">About</nuxt-link></li>
          <li><nuxt-link to="/tools-and-resources">Tools & Resources</nuxt-link></li>
          <li><nuxt-link to="/news-and-events">News & Events</nuxt-link></li>
        </ul>
      </div>
      <!-- TODO: Replace the links in this section with the actual pages when available  -->
      <div class="footer-section">
        <h3 class="footer-title">Resources.</h3>
        <ul>
          <li><nuxt-link to="/about">Help Center</nuxt-link></li>
          <li><nuxt-link to="/about">What’s New</nuxt-link></li>
        </ul>
      </div>
      <!-- TODO: Review the URLs and update as needed per the requirements from stakeholders -->
      <div class="footer-section">
        <h3 class="footer-title">Connections.</h3>
        <ul>
          <li><a href="https://forms.gle/FEFiDXQG3VB2aVW57" target="_blank">Contact Us</a></li>
          <li><a
              href="https://docs.google.com/forms/d/e/1FAIpQLSf4fzc1JysckHNI7RYLe3F5T8W2-0Nreb18JfZ3GaRqOdOpNQ/viewform"
              target="_blank">Join Us</a></li>
          <li><a href="https://forms.gle/FEFiDXQG3VB2aVW57" target="_blank">Share Data</a></li>
        </ul>
      </div>

      <div class="footer-socials">
        <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank"><svgo-icon-share-linked /></a>
        <a href="https://x.com" aria-label="X" target="_blank"><svgo-icon-share-twitter /></a>
        <a href="https://facebook.com" aria-label="Facebook" target="_blank"><svgo-icon-share-facebook /></a>
      </div>
    </div>

    <div class="footer-bottom">
      © 2024 Epilepsy.Science
    </div>
  </footer>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.footer {
  padding: 20px;
  background-color: #fff;
  font-family: Arial, sans-serif;
  color: #000;
  text-align: center;
}

.footer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 80vw;
  margin: 0 auto;
}

.footer-section {
  text-align: center;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 5px;

      a {
        text-decoration: none;
        color: #333;
        font-size: 1rem;
      }
      a:hover {
        text-decoration: underline;
      }
    }
  }
}

.footer-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
  position: relative;

  &::after {
    content: "";
    display: block;
    height: 2px;
    background-color: black;
    margin: 5px auto 0;
  }
}

.footer-socials {
  display: flex;
  gap: 15px;
  justify-content: center;

  a {
    color: #000;
    font-size: 1.5rem;
    display: inline-flex;
  }
}

.footer-bottom {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #666;
}

/* Larger screens */
@media (min-width: 768px) {
  .footer-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    text-align: left;

    .footer-section {
      margin-bottom: 0;
      text-align: left;
    }

    .footer-socials {
      justify-content: center;
    }
  }

  .footer-bottom {
    text-align: left;
    font-size: 0.8rem;
    color: #666;
    margin-top: 20px;
    max-width: 80vw;
    margin-inline: auto;
  }
}

@media (min-width: 1024px) {
  .footer-container {
    gap: 128px;
  }
}
</style>