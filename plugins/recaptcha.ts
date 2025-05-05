import { VueReCaptcha } from 'vue-recaptcha-v3';

// TODO: update Site key for epilepsy.science's recaptcha - currently using the one from Discover
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VueReCaptcha, {
        siteKey: '6Le2Wr0aAAAAAHouFUEmy7UwN6b9wa_PPRGrWxAG',
        loaderOptions: {
            autoHideBadge: true,
            explicitRenderParameters: {
                badge: 'bottomleft',
            },
        },
    });

});