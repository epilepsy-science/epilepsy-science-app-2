import { searchQueryReplacements } from '@/utils/utils'
const CTF_EVENT_ID = 'event'
const CTF_NEWS_ID = 'news'
const CTF_NEWS_AND_EVENTS_PAGE_ID = '27g94v7HnxrqsCKKA8Wf7o'

const replaceTerms = (terms) => {
  let result = terms
  if (result) {
    Object.entries(searchQueryReplacements).forEach(([term, replacement]) => result = result?.replace(term, replacement))
  }
  return result
}

export const fetchData = async (client, terms, limit) => {
  const query = replaceTerms(terms)
  try {
    const todaysDate = new Date()

    const upcomingEvents = await client.getEntries({
      content_type: CTF_EVENT_ID,
      order: 'fields.startDate',
      'fields.startDate[gte]': todaysDate.toISOString(),
      query,
      limit
    })

    const news = await fetchNews(client, query, undefined, undefined, undefined, undefined, limit)

    const page = await client.getEntry(CTF_NEWS_AND_EVENTS_PAGE_ID ?? '')

    return {
      upcomingEvents,
      news,
      page,
    }
  } catch (e) {
    console.error(e)
    return {
      upcomingEvents: {},
      news: {},
      page: {}
    }
  }
}

export const fetchEvents = async (client, terms, eventStartLessThanDate, eventStartGreaterThanOrEqualToDate, eventTypes, sortOrder, limit, skip) => {
  const query = replaceTerms(terms)
  try {
    return await client.getEntries({
      content_type: CTF_EVENT_ID,
      order: sortOrder || '-fields.startDate',
      query,
      limit,
      skip,
      'fields.startDate[lt]': eventStartLessThanDate,
      'fields.startDate[gte]': eventStartGreaterThanOrEqualToDate,
      'fields.eventType[in]': eventTypes
    })
  } catch (e) {
    console.error(e)
    return {}
  }
}

export const fetchNews = async (client, terms, publishedLessThanDate, publishedGreaterThanOrEqualToDate, subjects, sortOrder, limit, skip) => {
  const query = replaceTerms(terms)
  try {
    return await client.getEntries({
      content_type: CTF_NEWS_ID,
      order: sortOrder || '-fields.publishedDate',
      query,
      limit,
      skip,
      'fields.publishedDate[lt]': publishedLessThanDate,
      'fields.publishedDate[gte]': publishedGreaterThanOrEqualToDate,
      'fields.subject[in]': subjects
    })
  } catch (e) {
    console.error(e)
    return {}
  }
}
