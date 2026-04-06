import { createClient } from "contentful";

const EMPTY_COLLECTION = { items: [], total: 0, skip: 0, limit: 0 };
const EMPTY_ENTRY = { fields: {}, sys: {} };

function wrapClientWithFallback(client) {
  return {
    async getEntry(id, query) {
      try {
        return await client.getEntry(id, query);
      } catch (error) {
        console.warn("Contentful getEntry failed, returning empty entry. Error:", error?.status ?? error?.message);
        return EMPTY_ENTRY;
      }
    },
    async getEntries(query) {
      try {
        return await client.getEntries(query);
      } catch (error) {
        console.warn("Contentful getEntries failed, returning empty collection. Error:", error?.status ?? error?.message);
        return EMPTY_COLLECTION;
      }
    },
  };
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const isPreview = config.public.CTF_API_HOST === "preview.contentful.com";
  const accessToken = isPreview
    ? config.public.CTF_CPA_ACCESS_TOKEN
    : config.public.CTF_CDA_ACCESS_TOKEN;

  const client = createClient({
    space: config.public.CTF_SPACE_ID,
    accessToken,
    host: config.public.CTF_API_HOST,
    retryOnError: false,
  });

  return {
    provide: {
      contentfulClient: wrapClientWithFallback(client),
    },
  };
});