export default defineNuxtRouteMiddleware((to, from) => {
  const redirectUrls = [
    { oldUrl: 'about/policies-and-standards/privacy-policy', newUrl: 'https://docs.pennsieve.io/docs/privacy-policy' },
  ]

  const match = redirectUrls.find(item => to.fullPath.includes(item.oldUrl))

  if (match) {
    return navigateTo(match.newUrl, { external: true, redirectCode: 301 })
  }
})