import { createClient } from "contentful";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  // Use the same `createClient` function in both environments
  const client = createClient({
    space: config.public.CTF_SPACE_ID,
    accessToken: config.public.CTF_CDA_ACCESS_TOKEN,
    host: config.public.CTF_API_HOST,
  });

  return {
    provide: {
      contentfulClient: client,
    },
  };
});