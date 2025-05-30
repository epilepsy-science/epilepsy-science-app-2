<template>
  <el-table :data="tableData" :show-header="false" empty-text="No Results">
    <el-table-column width="160">
      <template v-slot="scope">
        <div class="image-container">
          <img v-if="scope.row.fields.institution" class="img-project" :src="getImageSrc(scope)"
            :alt="getImageAlt(scope)" />
        </div>
      </template>
    </el-table-column>

    <el-table-column min-width="400">
      <template v-slot="scope">
        <nuxt-link :to="{
            name: 'about-projects-projectId',
            params: { projectId: scope.row.sys.id },
          }" v-html="highlightMatches(scope.row.fields.title, $route.query.search)" />
        <div class="mt-8 mb-8" v-html="highlightMatches(scope.row.fields.shortDescription, $route.query.search)" />
        <table class="property-table">
          <tbody>
            <tr v-if="scope.row.fields.focus">
              <td class="property-name-column">
                Focus
              </td>
              <td v-html="highlightMatches(scope.row.fields.focus.join(', '), $route.query.search)" />
            </tr>
            <tr v-if="scope.row.fields.principalInvestigators">
              <td class="property-name-column">
                Principle Investigator(s)
              </td>
              <td v-html="highlightMatches(scope.row.fields.principalInvestigators.join(', '), $route.query.search)" />
            </tr>
            <tr v-if="scope.row.fields.institution">
              <td class="property-name-column">
                Institution(s)
              </td>
              <td>
                {{ getInstitutionNames(scope.row.fields.institutions) }}
              </td>
            </tr>
            <tr v-if="scope.row.fields.program.length > 0">
              <td class="property-name-column">
                Funding Program(s)
              </td>
              <td v-html="highlightMatches(scope.row.fields.program.join(', '), $route.query.search)" />
            </tr>
            <tr v-if="scope.row.fields.awardId">
              <td class="property-name-column">
                Award
              </td>
              <td>
                <a :href="getNihReporterUrl(scope)" target="_blank">
                  {{ scope.row.fields.awardId }}
                  <svgo-icon-open class="open-icon" v-if="!isInternalLink(getNihReporterUrl(scope))" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import Truncate from '@/mixins/truncate'
import { isInternalLink } from '@/mixins/marked/index'
import { highlightMatches } from '@/utils/utils'

export default {
  name: 'ProjectSearchResults',

  mixins: [Truncate],

  props: {
    tableData: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    /**
     * Get image source
     * @param {Object} scope
     * @returns {String}
     */
    getImageSrc: function(scope) {
      return scope.row.fields.institution.fields.logo
        ? scope.row.fields.institution.fields.logo.fields.file.url
        : ''
    },
    /**
     * Get image source
     * @param {Object} scope
     * @returns {String}
     */
    getImageAlt: function(scope) {
      return scope.row.fields.institution.fields.logo
        ? scope.row.fields.institution.fields.logo.fields.file.description
        : `Logo for ${scope.row.fields.institution.fields.name}`
    },

    /**
     * Get NIH Report Url
     * @param {Object} scope
     * @returns {String}
     */
    getNihReporterUrl: function(scope) {
      return scope.row.fields.nihReporterUrl || '#'
    },

    /**
     * Get short description for dataset
     * @param {Object} scope
     * @returns {String}
     */
    getShortDescription: function(scope) {
      return scope.row.fields.shortDescription || ''
    },

    getInstitutionNames(institutions) {
      let names = ''
      institutions.forEach(institution => {
        names += institution.fields.name + ", "
      })
      return names.substring(0, names.length - 2)
    },
    isInternalLink,
    highlightMatches
  }
}
</script>

<style lang="scss" scoped>
  @import 'sparc-design-system-components-2/src/assets/_variables.scss';

.el-table {
  width: 100%;
}
.img-project {
  height: auto;
  width: 100%;
  margin: auto;
}
.el-table--enable-row-hover .el-table__body tr {
  background-color: transparent;
}
.property-table {
  td {
    background-color: transparent !important;
    padding: 0.25rem 0 0 0;
    border: none;
  }
  background-color: transparent;
  border: none;
  padding: 0;
}
// The outermost bottom border of the table. Element UI adds psuedo elements to create the bottom table border that we must hide to remove
table:not([class^='el-table__'])::before {
  display: none;
}
.property-name-column {
  width: 11rem;
  font-weight: bold;
  background-color: transparent !important;
}
.image-container {
  display: flex;
  aspect-ratio: 1;
  border: 1px solid $lineColor2;
  background-color: white !important;
  padding: .25rem;
}

.open-icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
