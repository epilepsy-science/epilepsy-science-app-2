import { searchQueryReplacements } from '@/utils/utils';

const replaceTerms = (terms) => {
  let result = terms
  if (result) {
    Object.entries(searchQueryReplacements).forEach(([term, replacement]) => result = result?.replace(term, replacement))
  }
  return result
}
export const fetchResources = async (resourceType, terms, sortOrder, type, limit, skip) => {
  const { $contentfulClient } = useNuxtApp()
  const config = useRuntimeConfig()
  const query = replaceTerms(terms)
  // Since these are different fields in contentful, we must set them to undefined instead of false or else the query will always return false when it and's the values.
  // Eventually, we should update the content type to be one field that can have multiple tags/values set on it
  const developedBySparc = type?.includes('developedBySparc') ? true : undefined
  const codeathon = type?.includes('codeathon') ? true : undefined

  try {
    return await $contentfulClient.getEntries({
      content_type: config.public.ctf_resource_id,
      order: sortOrder || 'fields.name',
      query,
      limit,
      skip,
      'fields.resourceType[in]': resourceType,
      'fields.developedBySparc' : developedBySparc,
      'fields.codeathon' : codeathon
    }).then(async response => {
      return { ...response }
    })
  } catch (e) {
    console.error(e)
    return {}
  }
}

export const searchTypes = 
  [
    {
      label: 'Databases',
      path: 'databases',
      contentfulLabel: 'Data and Models'
    },
    {
      label: 'Software',
      path: 'software',
      contentfulLabel: 'Software'
    },
    {
      label: 'Information Services',
      path: 'information-services',
      contentfulLabel: 'Information Services'
    },
    {
      label: 'Devices',
      path: 'devices',
      contentfulLabel: 'Devices'
    },
    {
      label: 'Biological',
      path: 'biological',
      contentfulLabel: 'Biologicals'
    },
    {
      label: 'o²S²PARC Services',
      path: 'osparc-services'
    }
  ]

export const sortOptions = [
  {
    label: 'A-Z',
    id: 'alphabatical',
    sortOrder: 'fields.name'
  },
  {
    label: 'Z-A',
    id: 'reverseAlphabatical',
    sortOrder: '-fields.name'
  },
]
