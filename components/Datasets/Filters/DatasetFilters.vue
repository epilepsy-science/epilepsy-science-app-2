<script setup>
import IconRemove from "~/components/Icons/IconRemove.vue";
import IconMagnifyingGlass from "~/components/Icons/IconMagnifyingGlass.vue";
import {computed} from "vue";
const runtimeConfig = useRuntimeConfig()

defineExpose({
  clearFilters
})

const props = defineProps({

})

const emit = defineEmits([
  'refresh-datasets',
]);

onMounted((to, from) => {
  getTags()
})

const selectedTag = ref('')
const tags = ref([])
const resetTags = ref([])
const tagsUrl = computed(() => {
  return `${runtimeConfig.public.discover_api_host}/tags`
})
function getTags() {
  useSendXhr(tagsUrl.value,{
    header: {},
    method: 'GET',
  }).then((response) => {
    tags.value = response
    resetTags.value = response.map((tag) => ({ ...tag }))
  })
}

function emitChange() {
  emit('refresh-datasets', {
    publicFilter: publicFilter.value,
    embargoedFilter: embargoedFilter.value,
    tags: filteredTags.value
  })
}


function removeTag(removedTag) {
  const index = filteredTags.value.indexOf(removedTag)
  if (index > -1) {
    filteredTags.value.splice(index, 1)
  }
  tags.value.push({ tag: removedTag, count: 1 })
  emitChange()
}

function onSelectTags(tag) {
  filteredTags.value.push(tag)
  // remove selected tag from tags list
  tags.value.forEach((tagObj) => {
    if (tagObj.tag === tag) {
      const index = tags.value.indexOf(tagObj)
      if (index > -1) {
        tags.value.splice(index, 1)
      }
    }
  })
  selectedTag.value = ''
  emitChange()
}

// Filters
const isFiltersVisible = ref(false)
const embargoedFilter = ref(false)
const publicFilter = ref(true)
const filteredTags = ref([])

const totalFilterCount = computed( () => {
  const publicFilterCount = publicFilter.value ? 1 : 0
  const embargoedFilterCount = embargoedFilter.value ? 1 : 0
  return publicFilterCount + embargoedFilterCount + filteredTags.value.length
})

function clearFilters() {
  publicFilter.value = false
  embargoedFilter.value = false
  filteredTags.value = []
  tags.value = resetTags.value
  emitChange()
}


</script>

<template>
  <div class="dataset-filters">
    <p>Refine datasets by:</p>
    <h2>Status</h2>
    <div class="dataset-filters__checkbox">
      <el-checkbox v-model="publicFilter" @change="emitChange()"
      >Public</el-checkbox
      >
      <el-checkbox v-model="embargoedFilter" @change="emitChange()"
      >Embargoed</el-checkbox
      >
    </div>
    <hr />
    <h2>Tags</h2>
    <div class="tags-filter-input-wrap mb-16">
      <el-select
        ref="select"
        v-model="selectedTag"
        filterable
        class="mr-19 add-tag"
        :default-first-option="true"
        :visible-arrow="false"
        placeholder="Search"
        @change="onSelectTags"
      >
        <template #prefix>
          <icon-magnifying-glass
            :height="24"
            :width="24"
          />
        </template>

        <el-option
          v-for="(tag, index) in tags"
          :key="`${tag}-${index}`"
          :label="tag.tag"
          :value="tag.tag"
        >
        </el-option>
      </el-select>
    </div>
    <div
      v-for="(tag, index) in filteredTags"
      :key="`${tag}-${index}`"
      class="selected-tag"
    >
      {{ tag }}
      <button @click="removeTag(tag)">
        <icon-remove
          class="remove-icon"
          :height="8"
          :width="8"
        />
      </button>
    </div>
    <hr />
    <a
      :class="{
                  'not-active':
                    !publicFilter &&
                    !embargoedFilter &&
                    filteredTags.length === 0
                }"
      href="#"
      @click.prevent="clearFilters"
    >
      Clear all filters
    </a>
    <button
      class="btn-close-dataset-filters hidden-md-and-up"
      @click="isFiltersVisible = false"
    >
      <icon-remove
        :width="15"
        :height="15"
        color="#71747c"
        class="close-icon"
      />
    </button>
  </div>
</template>

<style scoped lang="scss">
  .dataset-filters {
    margin-top: 50px;
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
</style>