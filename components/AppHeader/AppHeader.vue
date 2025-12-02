<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-logo">
        <nuxt-link to="/"><img src="/logos/epilepsy-science-short-logo.svg" alt="epilepsy-science-logo" class="logo-img"/></nuxt-link>
        <img src="/logos/epilepsy-science-descriptive-logo.svg" alt="epilepsy-science-descriptive-logo"/>
      </div>

      <button class="hamburger-menu" @click="toggleMenu">
        <svgo-icon-hamburger height="25" width="25" />
      </button>

      <nav class="header-nav" :class="{ 'is-mobile-menu': menuOpen }">
        <ul>
          <li><nuxt-link to="/data?type=dataset">Data</nuxt-link></li>
          <li><nuxt-link to="/projects">Projects</nuxt-link></li>
          <li><nuxt-link to="/about">About</nuxt-link></li>
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

<style scoped lang="scss">
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
  margin-right: 10px;
}

.logo-text, .logo-text-bold {
  font-size: 1.2rem;
}

.logo-text-bold {
  font-weight: bold;
  margin-right: 8px;
}

.header-nav a {
  color: #297fca;
  text-decoration: none;
  text-transform: uppercase;
  display: inline-block;
  position: relative;
  overflow: hidden;
  padding: 5px 10px;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 0;
    background-color: #297FCA;
    transition: width 0.4s ease;
  }
}

.header-nav a.router-link-active {
  color: black;
  font-weight: bold;
  &::after {
    width: 100%;
  }
}


.header-nav a:hover,
.header-nav a:focus-visible {
  color: black;
  &::after {
    width: 100%;
  }
}

.header-nav ul li a:focus-visible {
  outline: 2px solid #297fca;
  outline-offset: 2px;
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