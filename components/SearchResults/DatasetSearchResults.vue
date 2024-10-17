<template>
  <el-table :data="tableData" :show-header="false" empty-text="No Results">
    <el-table-column prop="banner" label="Image" width="160">
      <template v-slot="scope">
        <div v-if="scope.row">
          <nuxt-link
            :to="{
              name: 'datasets-datasetId',
              params: { datasetId: scope.row.objectID },
              query: {
                type: 'dataset'
              }
            }"
            class="img-dataset"
          > 
            <img
              v-if="scope.row.banner"
              :src="scope.row.banner"
              :alt="`Banner for ${scope.row.name}`"
              height="128"
              width="128"
            />
          </nuxt-link>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      min-width="400"
    >
      <template v-slot:default="scope">
        <div v-if="scope.row">
          <nuxt-link
            :to="{
              name: 'datasets-datasetId',
              params: {datasetId: scope.row.objectID },
              query: {
                type: 'dataset'
              }
            }"
            v-html="scope.row.name"
          />
          <div
            class="my-8"
            v-if="scope.row.description"
            v-html="scope.row.description"
          />
          <table class="property-table">
            <tbody>
              <tr
              v-for="(property, index) in PROPERTY_DATA"
              v-show="getPropertyValue(scope.row, property)"
              :key="index">
              <td class="property-name-column">
                {{ property.displayName }}
              </td>
              <td v-html="getPropertyValue(scope.row, property)"></td>
            </tr>
            </tbody>
          </table>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import SparcPill from '@/components/SparcPill/SparcPill.vue'
import FormatDate from '@/mixins/format-date'
import StorageMetrics from '@/mixins/bf-storage-metrics'
import _ from 'lodash'

export default {
  name: 'DatasetSearchResults',

  components: { SparcPill },

  mixins: [FormatDate, StorageMetrics],

  props: {
    tableData: {
      type: Array,
      default: () => []
    },
  },

  data() {
    return {
      PROPERTY_DATA: [
        {
          displayName: 'Publication Date',
        }
      ]
    }
  },

  methods: {
    getPropertyValue: function(item, property) {
      if (item == undefined) {
        return undefined
      }
      switch (property.displayName) {
        case 'Publication Date': {
          if (item.firstPublishedAt == undefined || item.versionPublishedAt == undefined) {
            return undefined
          }
          const firstPublishedAt = item.firstPublishedAt.split(",")[0]
          const versionPublishedAt = item.versionPublishedAt.split(",")[0]
          return this.formatDate(firstPublishedAt) +
                    ' (Last updated ' +
                    this.formatDate(versionPublishedAt) +
                    ')'
        }
        default: {
          return _.upperFirst(_.get(item, property.propPath))
        }
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.el-table {
  width: 100%;
}

.el-table--enable-row-hover .el-table__body tr {
  background-color: transparent;
}

.img-dataset {
  display: block;
  position: relative;
  .sparc-pill {
    font-size: 0.75rem;
    position: absolute;
    right: 0.25rem;
    top: 0.5rem;
  }
  img {
    display: block;
  }
}
.property-table {
  background-color: transparent;
  border: none;
  padding: 0;
  
  td {
    background-color: transparent;
    padding: 0.25rem 0 0 0;
    border: none;
  }
}
// The outermost bottom border of the table. Element UI adds psuedo elements to create the bottom table border that we must hide to remove
table:not([class^='el-table__'])::before {
  display: none;
}
.property-name-column {
  width: 180px;
  font-weight: bold;
}
</style>
