<template>
  <div class="datasets-search-results">
    <div class="search-wrapper">
      <p>Search from published datasets</p>
      <search-controls-contentful placeholder="Find a dataset..." :showSearchText="true" />
    </div>
    <div class="results-wrapper">
      <div class="filters-wrapper">
        Refine results
      </div>
      <div class="dataset-results">
      </div>
    </div>
  </div>
</template>

<script setup>
// import { SearchControlsContentful } from "~/components/SearchControlsContentful/SearchControlsContentful.vue"
import testData from './mock.js';

const datasetsInfo = testData;

const myContainerItems = [
  {
    imageSrc: "https://example.com/image1.png",
    imageAlt: "Brain EEG Image 1",
    title: "Michigan High Res EEG - UMHS 0028",
    itemLink: "#",
    description: "Scalp, intracranial grid, and standard depth EEG for Michigan Patient 28. Class I outcome.",
    publicationDate: "December 18, 2023",
    lastUpdated: "December 18, 2023",
    additionalLinks: [
      { text: "View Details", url: "#" },
      { text: "Download Data", url: "#" },
    ],
  },
  {
    imageSrc: "https://example.com/image2.png",
    imageAlt: "Brain EEG Image 2",
    title: "Michigan High Res EEG - UMHS 0023",
    itemLink: "#",
    description: "Scalp, intracranial grid, and standard depth EEG for UMHS0023. Neuropace placed.",
    publicationDate: "December 18, 2023",
    lastUpdated: "December 18, 2023",
    additionalLinks: [
      { text: "View Details", url: "#" },
      { text: "Download Data", url: "#" },
    ],
  },
];
</script>

<style scoped lang="scss">
.datasets-search-results {
  padding: 32px;
}

.search-wrapper {
  width: 100%;
  padding: 16px;
  border-radius: 4px;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;

  p {
    font-size: 24px;
    font-weight: 500;
  }
}

.results-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 48px;
}


.filters-wrapper {
  width: 100%;
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}


.dataset-results {
  width: 100%;
}

.search-wrapper,
.filters-wrapper,
.dataset-results {
  background-color: white;
}

@media (min-width: 768px) {
  .results-wrapper {
    flex-direction: row;
  }

  .filters-wrapper {
    flex: 1 1 25%;
    max-width: 25%;
  }

  .dataset-results {
    flex: 1 1 75%;
    max-width: 75%;
  }
}
</style>