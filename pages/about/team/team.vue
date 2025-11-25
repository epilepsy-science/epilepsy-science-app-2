<script setup lang="ts">
const { $contentfulClient } = useNuxtApp();

const { data: teamMembers, error } = useLazyAsyncData("team", () => {
  return $contentfulClient.getEntries({
    content_type: "team",
  });
});

const getObjects = (items: any[], memberType: string) =>
  items.filter((o) => o.fields?.memberType?.includes(memberType));

const labMembers = computed(() => {
  return teamMembers.value?.items
    ? getObjects(teamMembers.value.items, "LabMember")
    : [];
});

const Collaborators = computed(() => {
  return teamMembers.value?.items
    ? getObjects(teamMembers.value.items, "Collaborator")
    : [];
});

const Alumni = computed(() => {
  return teamMembers.value?.items
    ? getObjects(teamMembers.value.items, "Alumni")
    : [];
});
</script>
<template>
  <div>
    <div class="section">
      <h1>Lab</h1>
      <div class="member-wrapper">
        <div
          v-for="(member, index) in labMembers"
          :key="member.sys?.id || index"
        >
          <TeamMember :member="member" />
        </div>
      </div>
    </div>

    <div class="section">
      <h1>Core Collaborators</h1>
      <div class="member-wrapper">
        <div
          v-for="(member, index) in Collaborators"
          :key="member.sys?.id || index"
        >
          <TeamMember :member="member" />
        </div>
      </div>
    </div>

    <div class="section">
      <h1>Alumni</h1>
      <div class="member-wrapper">
        <div v-for="(member, index) in Alumni" :key="member.sys?.id || index">
          <TeamMember :member="member" />
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.highlight-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  font-weight: 300;
  font-size: 24px;
  margin-bottom: 80px;

  .highlight-image {
    .highlight {
      display: block;
      height: 400px;
      width: 400px;
    }
  }
  .highlight-text {
    margin: 0 72px;
    font-size: 18px;
    color: $gray_5;
    line-height: 1.5em;
    align-self: center;
    max-width: 800px;
  }
}

.image-wrapper {
  text-align: center;
  margin-top: 60px;
  margin-bottom: 40px;
}

.why-section {
  display: flex;
  flex-direction: column;
  text-align: center;
  margin-bottom: 100px;
  margin-top: 24px;

  h1 {
    font-weight: 300;
  }

  .why-wrapper {
    display: flex;
    flex-direction: row;
    margin: 0 80px;
    justify-content: center;
    text-align: center;

    .why-column {
      width: 33.33%;
      margin: 0 16px;

      .item {
        text-align: justify;
        line-height: 21px;
        font-weight: 300;
        color: $gray_5;
        margin-top: 16px;
      }
    }
  }
}

.section {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

h1 {
  font-weight: 300;
  color: $purple_2;
}

.member-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
}

.featureSection {
  margin: 60px 80px 0 80px;
  padding: 24px;
  flex-direction: row;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  .feature {
    display: flex;
    flex-direction: row;
    max-width: 350px;
    align-items: center;
    .content {
      margin-left: 8px;
      .header {
        color: $gray_5;
        font-weight: 500;
        font-size: 16px;
      }
      .text {
        color: $gray_4;
        line-height: 1.1em;
        font-weight: 300;
        font-size: 14px;
      }
    }
    img {
      display: block;
      width: 86px;
      height: 86px;
    }
  }
}

.dataset-filters {
  margin-top: 50px;
}

.dataset-list-controls-wrap {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.search-icon {
  margin-top: 5px;
  color: $glial;
}

.tags-filter-input-wrap {
  display: flex;
  justify-content: space-between;
}

.add-tag {
  flex: 1;
  max-width: 475px;
  .el-input__prefix {
    display: flex;
    .svg-icon {
      align-self: center;
    }
  }
}

.selected-tag {
  background-color: $cortex;
  border-radius: 4px;
  font-weight: 400;
  font-size: 12px;
  color: #000;
  line-height: 14px;
  width: fit-content;
  padding: 5px 10px 5px 8px;
  margin-bottom: 4px;
}

.remove-icon {
  padding-left: 5px;
}

.discover-home {
  overflow-x: hidden;
}
</style>
