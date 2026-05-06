<template>
  <el-dialog
    v-model="showModal"
    :show-close="false"
    :append-to-body="true"
    class="accessibility-dialog"
    @close="closeDialog"
  >
    <template #header>
      <bf-dialog-header title="Accessibility Standards" @close="closeDialog" />
    </template>

    <div class="bf-dialog-body">
      <div>
        <p>
          The Epilepsy.Science is partially conformant with 
          <a
            href="https://www.w3.org/WAI/standards-guidelines/wcag/"
            alt="WCAG Guidelines"
            target="blank"
            >WCAG</a
          >
          guidelines. Partially conformant means that some parts of the content
          do not fully conform to the accessibility standard.
        </p>
        <p>
          We welcome your feedback on the accessibility of Epilepsy.Science.
          Please let us know if you encounter accessibility barriers on
          Epilepsy.Science:
        </p>
        <ul>
          <li>
            Email:
            <a href="mailto:support@epilepsy.science">support@epilepsy.science</a>
          </li>
        </ul>
        <p>We try to respond to feedback within 3-5 business days.</p>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'AccessibilityDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    showModal() {
      return this.visible
    }
  },

  methods: {
    /**
     * Closes the dialog
     */
    closeDialog: function() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
.accessibility-dialog.el-dialog {
  padding: 32px;

  .el-dialog__header {
    padding-bottom: 32px
  }
}
</style>
