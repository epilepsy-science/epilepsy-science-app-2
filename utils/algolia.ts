import { SearchIndex } from "algoliasearch";
// Mapping between display categories and their Algolia index property path
// Used for populating the Dataset Search Results facet menu dynamically
export const facetPropPathMapping = [
  {
    label: 'Tags',
    id: 'tags',
    facetPropPath: 'tags',
    facetSubpropPath: ''
  },
  {
    label: 'Contributors',
    id: 'contributors.lastName',
    facetPropPath: 'contributors.lastName',
    facetSubpropPath: ''
  },
]

export const getAlgoliaFacets = function(algoliaIndex : SearchIndex, propPathMapping : Array<{id: string, facetPropPath: string, facetSubpropPath: string, label: string}>, filters : string) {
  const facetPropPaths = propPathMapping.map(item => item.facetPropPath)
  const facetSubpropPaths = propPathMapping.map(item => item.facetSubpropPath)
  var facetData: { label: String, id: number, children: object[], key: string }[] = []
  var facetId = 0
  return algoliaIndex
    .search('', {
      sortFacetValuesBy: 'alpha',
      facets: facetPropPaths.concat(facetSubpropPaths),
      filters: filters || ''
    })
    .then(response => {
      facetPropPaths.map((facetPropPath: string) => {
        const parentFacet = propPathMapping.find(item => item.facetPropPath == facetPropPath)
        var children: { label: string, id: number, children: Object, facetPropPath: string }[] = []
        const responseFacets = response.facets
        if (responseFacets === undefined) {return}
        const responseFacetChildren =
          responseFacets[facetPropPath] == undefined
            ? {}
            : responseFacets[facetPropPath]
        const allPossibleChildrenSubfacets = parentFacet && responseFacets[parentFacet.facetSubpropPath] ? Object.keys(responseFacets[parentFacet.facetSubpropPath]) : []
        Object.keys(responseFacetChildren).map(facet => {
          const childrenSubfacets = allPossibleChildrenSubfacets.reduce((filtered, childFacetInfo) => {
            const info = childFacetInfo.split('.')
            if (info.length != 2) {
              return filtered
            }
            if (facet == info[0]) {
              filtered.push({
                label: childFacetInfo, 
                id: facetId++,
                facetPropPath: `${parentFacet?.facetSubpropPath}`
              })
            }
           return filtered;
          }
          , Array<{label: string, id: number, facetPropPath: string}>())
          children.push({
            label: facet,
            id: facetId++,
            children: childrenSubfacets,
            facetPropPath: facetPropPath
          })
        })
        if (children.length > 0) {
          facetData.push({
            label: parentFacet?.label || '',
            id: facetId++,
            children: children,
            key: facetPropPath
          })
        }
      })
      return facetData
    }).catch(() => {
      return {}
    })
}