<template>
  <Head>
    <Title>{{ resource.fields.name }}</Title>
    <Meta name="og:title" hid="og:title" :content="resource.fields.name" />
    <Meta name="twitter:title" :content="resource.fields.name" />
    <Meta name="description" hid="description" :content="resource.fields.description" />
    <Meta name="og:description" hid="og:description" :content="resource.fields.description" />
    <Meta name="twitter:description" :content="resource.fields.description" />
  </Head>
  <div class="resources">
    <tools-and-resources-page :page="resource" :content="resource.fields.longDescription" :breadcrumb="breadcrumb"
      :hero-title="resource.fields.name" :hero-summary="resource.fields.description" type="resource">
      <div class="row">
        <div class="image-button-container">
          <div class="image-container mr-16 mb-8">
            <img v-if="resourceLogoUrl" class="resource-image" :src="resourceLogoUrl" :alt="resourceLogoAlt" />
          </div>
        </div>
        <div class="truncated">
          <client-only>
            <sparc-tooltip placement="bottom-center" :content="resource.fields.name" is-repeating-item-content>
              <template #item>
                <div class="heading1 truncated">
                  {{ resource.fields.name }}
                </div>
              </template>
            </sparc-tooltip>
          </client-only>
          <span v-if="resource.fields.developedBySparc" class="mb-4 resource-category">
            SPARC
          </span>
          <span v-if="resource.fields.codeathon" class="mb-16 resource-category">
            Codeathon
          </span>
          <div class="label4">
            URL
          </div>
          <a class="resource-url truncated" :href="resource.fields.url" target="_blank">
            {{ fullResourceUrl }}
          </a>
          <template v-if="resource.fields.owner">
            <div class="label4">
              Owner
            </div>
            <div class="truncated">
              {{ resource.fields.owner }}
            </div>
          </template>
          <template v-if="resource.fields.contactEmail">
            <div class="label4">
              Contact Email
            </div>
            <div class="truncated">
              {{ resource.fields.contactEmail }}
            </div>
          </template>
          <template v-if="resource.fields.program">
            <div class="label4">
              Funding Program(s)
            </div>
            <div class="truncated">
              {{ fundingPrograms }}
            </div>
          </template>
          <div class="mt-4 label4">
            Share
          </div>
          <share-links class="mb-16" />
        </div>
      </div>
    </tools-and-resources-page>
    <div class="container">
      <nuxt-link class="back-link" to="/tools-and-resources/tools">
        View All Tools & Resources >
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import { pathOr } from 'ramda'
import ToolsAndResourcesPage from '@/components/ToolAndResourcesPage/ToolsAndResourcesPage.vue'
import ShareLinks from '@/components/ShareLinks/ShareLinks'

export default {
  name: 'Resource',

  components: {
    ToolsAndResourcesPage,
    ShareLinks
  },

  async setup() {
    const { $contentfulClient } = useNuxtApp()
    const route = useRoute()
    const resource = await $contentfulClient.getEntry(route.params.resourceId)
    const isTool = pathOr(false, ['fields', 'category'], resource)
    const parentPage = {
      label: isTool ? 'Tools' : 'Resources',
      path: isTool ? 'tools' : 'resources'
    }
    return {
      resource,
      breadcrumb: [
        {
          label: 'Home',
          to: {
            name: 'index'
          }
        },
        {
          label: 'Tools & Resources',
          to: {
            path: 'tools'
          }
        },
        {
          label: `${parentPage.label}`,
          to: {
            path: `${parentPage.path}`
          }
        }
      ]
    }
  },

  computed: {
    /**
     * Compute the URL for the resource's logo
     * @returns {String}
     */
    resourceLogoUrl: function () {
      return pathOr(
        '',
        ['fields', 'logo', 'fields', 'file', 'url'],
        this.resource
      )
    },
    /**
     * Compute the alt tag for the resource's logo
     * @returns {String}
     */
    resourceLogoAlt: function () {
      return pathOr('', ['fields', 'logo', 'fields', 'title'], this.resource)
    },
    fullResourceUrl() {
      const url = pathOr('', ['fields','url'], this.resource)
      if (url.indexOf('://') > 0 || url.indexOf('//') === 0) {
        return url
      } else {
        return `${this.$config.public.ROOT_URL}${url}`
      }
    },
    fundingPrograms() {
      return this.resource.fields.program.join(", ")
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.resources {
  background-color: $background;
  padding-bottom: 2rem;
}

.resource-category {
  background: $es-primary-color;
  border-radius: 15px;
  color: #fff;
  margin-right: .25rem;
  font-size: 0.875rem;
  top: 10px;
  padding: 0.2rem 0.6rem;
  right: 14px;
  width: fit-content;
}

.resource-url {
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: underline;
}

.resource-image {
  width: 100%;
  max-width: 20rem;
}

.row {
  display: flex;
  flex-flow: wrap;
  cursor: default;
}

.image-container {
  align-self: center;
}

.truncated {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.back-link {
  color: $es-primary-color;
  font-weight: 700;
}
.image-button-container {
  text-align: center;
}
</style>
