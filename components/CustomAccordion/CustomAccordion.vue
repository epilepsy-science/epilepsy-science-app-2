<template>
  <section class="epilepsy-science-accordion">
    <h2 class="section-title">What can I do on Epilepsy.Science?</h2>
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item
        v-for="(item, index) in items"
        :key="index"
        :title="item.accordionTitle"
        :name="`item-${index}`"
      >
        <CustomAccordionItem :contentData="item.content" />
      </el-collapse-item>
    </el-collapse>
  </section>
</template>

<script setup lang="ts">
interface AccordionItem {
  accordionTitle: string;
  content: AccordionItemContent;
}

interface AccordionItemContent {
  title: string;
  description: string;
  imgSrc: string;
  redirectLink1Text?: string;
  redirectLink2Text?: string;
  redirectLink1Url?: string;
  redirectLink2Url?: string;
}
import { ref } from 'vue';
import { mockAccordionData } from '../../assets/mocks/mockAccordionData';

const activeName = ref('item-0');

const items = ref<AccordionItem[]>(mockAccordionData);
</script>

<style scoped lang="scss">
.epilepsy-science-accordion {
  background-color:#F5F5F5;
  border: 1px solid black;

  .section-title {
    font-size: 1.8rem;
    font-weight: 500;
    text-align: center;
    padding: 20px;
    border-bottom: 1px solid black;
  }
  h2 {
    margin-block: 0px;
  }
}
</style>