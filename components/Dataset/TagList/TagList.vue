<template>
  <ul class="tag-list unstyled">
    <li v-for="tag in tags" :key="tag">
      <NuxtLink
        class="tag-list-tag"
        :to="{
          name: 'index',
          query: {
            tag: tag
          }
        }"
      >
        {{ tag }}
      </NuxtLink>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'TagList',

  props: {
    tags: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss">
.tag-list {
  li {
    display: inline-block;
    margin: 0 8px 8px 0;
  }
}
.tag-list-tag {
  border-radius: 4px;
  background-color: #cddaff;
  color: #1c46bd;
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 16px;
  padding: 8px;
  text-align: center;
  text-decoration: none;
  &:hover,
  &:focus {
    background-color: white;
    text-decoration: none;
  }
}
</style>
