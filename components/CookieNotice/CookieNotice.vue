<template>
  <div class="cookie-notice">
    <div class="cookie-notice__inner">
      <div class="cookie-notice__icon">🍪</div>
      <div class="cookie-notice__copy">
        <p class="cookie-notice__heading">
          This website uses cookies to ensure you get the best experience.
        </p>
        <p class="cookie-notice__body">
          By closing this banner or clicking accept, you agree to the use of cookies.
          <a href="https://docs.pennsieve.io/docs/privacy-policy" target="_blank" rel="noopener">
            Privacy Policy
          </a>
          <span class="cookie-notice__separator">·</span>
          <a href="#" @click.prevent="openAccessibilityDialog">Accessibility Standards</a>
        </p>
      </div>
      <div class="cookie-notice__actions">
        <el-button type="primary" @click="closeNotice">Accept</el-button>
        <el-button id="cookie-close-btn" class="btn-close" @click="closeNotice">✕</el-button>
      </div>
    </div>
    <accessibility-dialog
      v-model:visible="accessibilityDialogVisible"
      @close="closeAccessibilityDialog"
    />
  </div>
</template>

<script>
import AccessibilityDialog from '../AccessibilityDialog/AccessibilityDialog.vue'

export default {
  name: 'CookieNotice',

  components: {
    AccessibilityDialog
  },

  data() {
    return {
      accessibilityDialogVisible: false
    }
  },
  methods: {
    /**
     * Close notice and accept the policy
     */
    closeNotice: function() {
      const today = new Date()
      const expirationDate = new Date(today.setDate(today.getDate() + 30))
      const gdprCookie = useCookie('GDPR:accepted', { expires: expirationDate })
      gdprCookie.value = true
    },

    /**
     * Opens Accessibility Dialog
     */
    openAccessibilityDialog: function() {
      this.accessibilityDialogVisible = true
    },

     /**
      * Closes Accessibility Dialog
      */
    closeAccessibilityDialog: function() {
      this.accessibilityDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.cookie-notice {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  background: #fff;
  color: $gray_6;
  padding: 1rem 1.5rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
}

.cookie-notice__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 48em) {
    flex-wrap: wrap;
  }
}

.cookie-notice__icon {
  font-size: 1.5rem;
  flex-shrink: 0;

  @media (max-width: 48em) {
    display: none;
  }
}

.cookie-notice__copy {
  flex: 1;
}

.cookie-notice__heading {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  line-height: 1.3;
}

.cookie-notice__body {
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
  opacity: 0.85;

  a {
    color: $es-primary-color;
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      opacity: 0.8;
    }
  }
}

.cookie-notice__separator {
  margin: 0 0.35rem;
  opacity: 0.5;
}

.cookie-notice__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;

  :deep(.el-button--primary) {
    font-weight: 600;
    border-radius: 6px;
    padding: 0.5rem 1.5rem;
  }
}

.btn-close {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  color: $gray_4 !important;
  font-size: 1rem;
  padding: 0.25rem !important;
  cursor: pointer;

  &:hover {
    color: $gray_6 !important;
  }
}
</style>
