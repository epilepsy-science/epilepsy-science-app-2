<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo Section -->
      <div class="header-logo">
        <!--TODO: when assets available <img src="@/assets/image.png" alt="Logo" class="logo-img" /> -->
        <span class="logo-text-bold"><nuxt-link to="/">E.S</nuxt-link></span>
        <span class="logo-text">EPILEPSY.SCIENCE</span>
      </div>

      <button class="hamburger-menu" @click="toggleMenu">
        <svgo-icon-hamburger height="25" width="25" />
      </button>

      <nav class="header-nav" :class="{ 'is-mobile-menu': menuOpen }">
        <ul>
          <li><nuxt-link to="/data?type=dataset">Data</nuxt-link></li>
          <li><nuxt-link to="/about">About</nuxt-link></li>
          <li><nuxt-link to="/tools-and-resources">Tools</nuxt-link></li>
          <li><nuxt-link to="/news-and-events/news">News</nuxt-link></li>
          <li><nuxt-link to="/news-and-events/events">Events</nuxt-link></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const menuOpen = ref(false);
const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 0);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const updateWindowWidth = () => {
  if (typeof window !== "undefined") {
    windowWidth.value = window.innerWidth;
  }
};

// Watch for changes in windowWidth and close the menu if switching to larger screens
watch(windowWidth, (newWidth) => {
  if (newWidth >= 768 && menuOpen.value) {
    menuOpen.value = false;
  }
});

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateWindowWidth);
    updateWindowWidth(); // Set initial width on mount
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateWindowWidth);
  }
});
</script>

<style scoped>
.app-header {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 100;
}

.header-container {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.header-logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 40px;
  margin-right: 10px;
}

.logo-text, .logo-text-bold {
  font-size: 1.2rem;
}

.logo-text-bold {
  font-weight: bold;
  margin-right: 8px;
}

a {
  color: black;
  text-decoration: none;
}

.hamburger-menu {
  display: inline-flex;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
}

.header-nav {
  display: none;
}

.header-nav.is-mobile-menu {
  display: block;
  position: absolute;
  top: 60px;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 10px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-nav ul {
  display: flex;
  flex-direction: column;
  list-style: none;
  gap: 10px;
}

.header-nav ul li a {
  text-decoration: none;
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
}

/* Active link styling */
.header-nav ul li a.router-link-active {
  background-color: #f0f4f8; /* Light background for active */
  color: #e76f50; /* Highlight color for active link text */
  font-weight: bold;
}

/* Hover and focus styling for mild highlight */
.header-nav ul li a:hover,
.header-nav ul li a:focus-visible {
  background-color: #e3eaf1; /* Milder background for hover and focus */
  color: #e76f50;
}

/* Ensure keyboard-only focus with focus-visible */
.header-nav ul li a:focus-visible {
  outline: 2px solid #e76f50; /* Visible focus outline for keyboard navigation */
  outline-offset: 2px;
}

@media (min-width: 768px) {
  .hamburger-menu {
    display: none;
  }

  .header-nav {
    display: flex;
    position: static;
    box-shadow: none;
    padding: 0;
  }

  .header-nav ul {
    flex-direction: row;
    gap: 15px;
  }
}
</style>