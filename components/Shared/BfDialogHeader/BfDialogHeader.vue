<template>
  <div class="bf-dialog-header">
    <span class="bf-dialog-header-title">{{ title }}</span>
    <button v-if="!this.$slots.tabs" class="icon-close-button" @click="onClose">
      <IconRemove :height="12" :width="12" />
    </button>
    <slot name="tabs" />
  </div>
</template>

<script>
import IconRemove from "~/components/Icons/IconRemove.vue";

export default {
  name: 'BfDialogHeader',
  components: {IconRemove},

  props: {
    title: {
      type: String,
      default: ''
    }
  },

  methods: {
    /**
     * Trigger el-dialog close event
     */
    onClose() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
//@use '../../../assets/css/_variables.scss';

.bf-dialog-header {
  align-items: center;
  display: flex;
  position: relative;
  .icon-close-button {
    cursor: pointer;
    background: none;
    border: none;
    outline: none;
    padding: 0;
    cursor: pointer;
  }
}
.bf-dialog-header-title {
  flex: 1;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  //color: $purple_3;
}
.tabs {
  bottom: -25px;
  right: 40px;
  position: absolute;
}
</style>
