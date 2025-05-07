<template>
  <div class="contributor-item" :class="{ 'has-orcid': hasOrcid }">
    <el-popover
      ref="popper"
      placement="top-start"
      width="320"
      trigger="hover"
      popper-class="full-content orcid-popover"
      :disabled="!hasOrcid"
      @show="getOrcidData"
    >
      <template #default>
        <div v-loading="isLoadingOrcid" element-loading-background="#fff">
          <template v-if="isOrcidDataNotFound">
            ORCID iD Not Found
          </template>
          <template v-if="hasOrcidDataError">
            Sorry, an error has occurred.
          </template>
          <template
            v-if="isOrcidDataNotFound === false && hasOrcidDataError === false"
          >
            <h2>{{ orcidName }}</h2>
            <p>
              <strong>ORCID iD</strong>:
              <template v-if="orcidUri">
                <a :href="orcidUri" target="_blank">
                  {{ orcidId }}
                </a>
              </template>
              <template v-else>
                {{ orcidId }}
              </template>
            </p>
            <p v-if="lastEmploymentOrganizationName !== ''">
              <strong>Organization</strong>: {{ lastEmploymentOrganizationName }}
            </p>
            <p v-if="lastEmploymentRole !== ''">
              <strong>Title</strong>: {{ lastEmploymentRole }}
            </p>
          </template>
        </div>
      </template>

      <template #reference>
        <span>
        {{ displayName }}
      </span>
      </template>

    </el-popover>
  </div>
</template>

<script>
import { compose, defaultTo, head, pathOr, propOr } from 'ramda'

import { displayNameAndDegree } from '~/utils/displayNameAndDegree.js'

export default {
  name: 'ContributorItem',

  props: {
    contributor: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      isLoadingOrcid: true,
      isOrcidDataNotFound: false,
      hasOrcidDataError: false,
      orcidData: {}
    }
  },

  computed: {
    /**
     * Compute contributors full name
     * @return {String}
     */
    displayName() {
      return displayNameAndDegree(this.contributor)
    },

    /**
     * Compute name from ORCID
     * @returns {String}
     */
    orcidName() {
      const name = pathOr({}, ['person', 'name'], this.orcidData)
      const givenName = pathOr('', ['given-names', 'value'], name)
      const familyName = pathOr('', ['family-name', 'value'], name)

      return `${givenName} ${familyName}`
    },

    /**
     * Compute last employment
     * @return {Object}
     */
    lastEmployment() {
      return compose(
        defaultTo({}),
        head,
        pathOr([], ['activities-summary', 'employments', 'employment-summary'])
      )(this.orcidData)
    },

    /**
     * Compute the name of last employment
     * @returns {String}
     */
    lastEmploymentOrganizationName() {
      return pathOr('', ['organization', 'name'], this.lastEmployment)
    },

    /**
     * Compute the role of last employment
     * @returns {String}
     */
    lastEmploymentRole() {
      return propOr('', 'role-title', this.lastEmployment)
    },

    /**
     * Compute ORCID iD
     * @returns {String}
     */
    orcidId() {
      return propOr('', 'orcid', this.contributor)
    },

    /**
     * Compute ORCID profile uri
     * @returns {String}
     */
    orcidUri() {
      return pathOr('', ['orcid-identifier', 'uri'], this.orcidData)
    },

    /**
     * Compute if the contribut has an ORCID iD
     * @returns {Boolean}
     */
    hasOrcid() {
      return Boolean(this.orcidId)
    }
  },

  methods: {
    /**
     * Send a request for ORCID data
     */
    async getOrcidData() {
      this.isOrcidDataNotFound = false
      this.hasOrcidDataError = false
      // this.$nextTick(() => {
      //   this.$refs.popper.updatePopper()
      // })

      if (this.hasOrcid && Object.keys(this.orcidData).length === 0) {

        const myHeaders = new Headers();
        myHeaders.append('Content-type', 'application/json')


        await fetch(`https://pub.orcid.org/v2.1/${this.orcidId}`,{headers: myHeaders})
          .then((response) => {
             return response.json()
          }).then((json) => {
            this.orcidData = json
          }).catch((response) => {
            switch (response.status) {
              case 404:
                this.isOrcidDataNotFound = true
                break
              default:
                this.hasOrcidDataError = true
            }
          })
          .finally(() => {
            this.isLoadingOrcid = false
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.has-orcid {
  text-decoration: underline;
}
</style>
<style lang="scss">
.orcid-popover {
  min-height: 52px;
  p:last-of-type {
    margin: 0;
  }
}
</style>
