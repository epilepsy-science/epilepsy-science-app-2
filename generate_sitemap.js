import { simpleSitemapAndIndex } from 'sitemap'
import algoliasearch from 'algoliasearch'
import contentful from 'contentful'

const PORTAL_BASE_URL = process.env.ROOL_URL || 'https://staging.epilepsy.science'

// Algolia creds
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY
const ALGOLIA_INDEX = process.env.ALGOLIA_INDEX || 'epilepsy_science_index'

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY)
const algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX)

// Contentful
const CTF_SPACE_ID = process.env.CTF_SPACE_ID
const CTF_CDA_ACCESS_TOKEN = process.env.CTF_CDA_ACCESS_TOKEN
const CTF_API_HOST = process.env.CTF_API_HOST || 'preview.contentful.com'

// Checking required variables
if (
  ![
    PORTAL_BASE_URL,
    ALGOLIA_APP_ID,
    ALGOLIA_API_KEY,
    ALGOLIA_INDEX,
    CTF_SPACE_ID,
    CTF_CDA_ACCESS_TOKEN,
    CTF_API_HOST
  ].every(env => env)
) {
  console.error('At least one required environment variable is missing.')
  process.exit(9)
}

const contentfulClient = contentful.createClient({
  space: CTF_SPACE_ID,
  accessToken: CTF_CDA_ACCESS_TOKEN,
  host: CTF_API_HOST
})

// Add static URLs here
const urls = new Set([
  '/data',
  '/about',
])

// Fetching DATASETS from Algolia
process.stdout.write('Fetching datasets from Algolia...')

const datasetResp = await algoliaIndex.search('', {
  hitsPerPage: 9999,
  facets: '["*"]',
  filters: '(NOT item.published.status:embargo OR item.published.status:embargo) AND item.types.name:Dataset'
})

process.stdout.clearLine(0)
process.stdout.cursorTo(0)
process.stdout.write('Fetching datasets from Algolia... Done. Found ' + datasetResp.hits.length + ' URLs.\n')

datasetResp.hits.forEach(dataset => {
  urls.add(PORTAL_BASE_URL + '/datasets/' + dataset.objectID)
})

// Fetching PROJECTS from Contentful
process.stdout.write('Fetching projects from Contentful...')

const projectResp = await contentfulClient.getEntries({
  content_type: 'project',
  limit: 1000
})

process.stdout.clearLine(0)
process.stdout.cursorTo(0)
process.stdout.write('Fetching projects from Contentful... Done. Found ' + projectResp.items.length + ' URLs.\n')

projectResp.items.forEach(project => {
  urls.add(PORTAL_BASE_URL + '/projects/' + project.sys.id)
})

console.log('Finished scraping data. URLs found:', urls.size)
process.stdout.write('Generating sitemap...')

simpleSitemapAndIndex({
  hostname: PORTAL_BASE_URL,
  destinationDir: './public',
  sourceData: Array.from(urls).map(url => ({ url }))
})

process.stdout.clearLine(0)
process.stdout.cursorTo(0)
console.log('Generating sitemap... Done. Sitemap and sitemap index can be found in ./public.')
