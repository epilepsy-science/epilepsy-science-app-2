<script setup>
import IconLinkedIn from "~/components/Icons/IconLinkedIn.vue";

const props = defineProps({
  member: {
    type: Object,
    default: () => {},
  },
});
</script>

<template>
  <div class="wrapper">
    <img
      v-if="props.member.fields?.photo?.fields?.file?.url"
      class="member-img"
      ref="img"
      :src="`https://${props.member.fields.photo.fields.file.url}?w=180`"
      alt="Team member photo"
    />
    <div class="name">
      {{ props.member.fields?.Name }}
    </div>
    <div class="role">
      {{ props.member.fields?.role }}
    </div>
    <NuxtLink
      v-if="props.member.fields?.linkedIn"
      class="social"
      :to="props.member.fields.linkedIn"
    >
      <IconLinkedIn />
    </NuxtLink>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables";
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 72px;
  font-size: 20px;
  color: $gray_4;
  line-height: 1.5em;
  text-align: center;
  width: 180px;

  .member-img {
    width: 180px;
    border-radius: 50%;
    box-shadow: 4px 4px 10px $purple_2;
  }

  .name {
    margin-top: 16px;
    font-size: 18px;
    font-weight: 500;
    color: $purple_2;
  }

  .role {
    color: $gray_5;
    font-weight: 300;
    font-size: 14px;
    max-width: 200px;
    line-height: 16px;
  }

  .social {
    margin-top: 8px;
    color: $purple_2;
  }
}
</style>
