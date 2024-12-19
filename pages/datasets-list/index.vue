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
        Dataset results
      </div>
    </div>
  </div>
</template>

<script>
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
  height: 700px;
  width: 100%;
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}


.dataset-results {
  height: 700px;
  width: 100%;
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.search-wrapper, .filters-wrapper, .dataset-results {
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