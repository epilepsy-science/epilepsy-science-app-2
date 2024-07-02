<template>
  <div class="sparc-pill">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'SparcPill'
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.sparc-pill {
  background: #e76f50;
  border-radius: 15px;
  color: #fff;
  font-size: 0.875rem;
  max-width: 100%;
  padding: 0 0.65rem;
  text-overflow: ellipsis;
  cursor: default;
}
</style>
