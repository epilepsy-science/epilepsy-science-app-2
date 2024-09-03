/**
 * Get homepage fields, but default to empty values
 * @param {Object} field
 * @returns {Object}
 */
export default (fields = {}) => {
  return {
    heroHeading: fields.heroHeading || '',
    heroCopy: fields.heroCopy || '',
    heroImage: fields.heroImage || {},
    featuredData: fields.featuredData || [],
    newsAndEvents: fields.newsAndEvents || [],
    portalFeatures: fields.portalFeatures || [],
    exploreData: fields.exploreData || [],
    title: fields.title || ''
  }
}
