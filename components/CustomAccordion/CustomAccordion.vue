<template>
  <section class="epilepsy-science-accordion">
    <h2 class="section-title">What can I do on Epilepsy.Science?</h2>
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item
        v-for="item in items"
        :title="item.title"
        :name="item.id"
      >
        <p>{{ item.content }}</p>
      </el-collapse-item>
    </el-collapse>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeName = ref('1');

const items = ref([
  { id: '1', title: 'Access Worldwide Research', content: 'Access global research data sets, publications, and scientific findings relevant to epilepsy research.' },
  { id: '2', title: 'Create Data Cohorts', content: 'Build and manage data cohorts for your research projects, tailored to specific study requirements.' },
  { id: '3', title: 'Download Data', content: 'Here you can review abstracts, data overviews, and detailed file information. Understand data types, formats, and usage notes to support your research effectively.' },
  { id: '4', title: 'Contribute Your Data', content: 'Share your own research data with the epilepsy science community to advance understanding and support collaborative efforts.' }
]);
</script>

<style scoped lang="scss">
.epilepsy-science-accordion {
  background-color:#F5F5F5;
  border: 2px solid #F5F5F5;

  .section-title {
    font-size: 1.8rem;
    font-weight: 500;
    text-align: center;
    padding: 20px;
  }
}
</style>