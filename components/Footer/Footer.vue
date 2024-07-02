<template>
  <div class="footer">
    <div class="container">
      <el-row :gutter="32">
        <el-col :sm="{ span: 22, offset: 1 }" :md="{ span: 12, offset: 0 }">
          <div class="footer__info">
            <div class="footer__info--logo">
              <nuxt-link :to="{ name: 'index' }">
                <client-only><img class="logo" :src="EpilepsyLogo" alt="Logo for Epilepsy.science" /></client-only>
              </nuxt-link>
            </div>
            <div class="footer__info--blurb">
              <p>
                {{ footerData.footerDescription }}
              </p>
            </div>
          </div>
        </el-col>
        <el-col :sm="{ span: 22, offset: 1 }" :md="{ span: 8, offset: 4 }">
          <div class="footer__links">
            <el-row :gutter="32">
              <el-col :span="12">
                <h3>Learn More</h3>
                <ul>
                  <li
                    v-for="learnMoreLink in footerData.learnMoreLinks"
                    :key="learnMoreLink.fields.url"
                  >
                    <footer-link :link="learnMoreLink" />
                  </li>
                </ul>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import FooterLink from './FooterLink.vue'
import { useMainStore } from '../store/index.js'
import EpilepsyLogo from '@/assets/epilepsy.science.png'

export default {
  name: 'EpilepsyFooter',
  components: {
    FooterLink
  },
  computed: {
    ...mapState(useMainStore, ['footerData'])
  },
  data() {
    return {
      EpilepsyLogo
    }
  }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.footer {
  display: flex;
  flex-direction: row;
  padding: 3rem 1rem;
  background-color: #F8FAFF;

  &__info {
    &--logo {
      height: 4rem;
      margin-bottom: 1.5rem;
    }

    &--blurb {
      margin-bottom: 3rem;
      p {
        font-size: 1rem;
        font-weight: normal;
        line-height: 2rem;
        color: $mediumGrey;
      }
    }
  }

  &__links {
    h3 {
      font-size: 1rem;
      font-weight: bold;
      line-height: 2rem;
      color: $mediumGrey;
    }
    ul {
      list-style: none;
      padding-left: 0;

      li {
        padding-bottom: 1rem;
      }

      a {
        color: $mediumGrey;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

@media screen and (max-width: 1023px) {
  .footer {
    &__info {
      &--logo {
        height: 2rem;
      }

      &--blurb {
        font-size: 0.75rem;
        font-weight: normal;
        line-height: 1.25rem;

        p {
          margin-bottom: 1rem;
        }
      }
    }
  }
}

.footer__info--logo {
  img {
    height: 4rem;
    width: 8rem;
  }
}

img {
  display: block;
  height: auto;
  width: 100%;
}
</style>
