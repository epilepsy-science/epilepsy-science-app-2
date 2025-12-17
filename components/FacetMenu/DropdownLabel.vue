<template>
  <div :class="{ disabled: disabled }">
    <div @click="onArrowClicked" :class="showCollapsibleArrow ? 'label-header-clickable' : ''" class="label-header">
      <span>
        <span class="label-title">{{ label }}</span>
        <el-tooltip v-if="showHelpIcon" placement="bottom" :content="tooltip" raw-content>
          <svg class="ml-4 help-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="12" cy="15.824" r="0.753"/>
            <path d="M12,14.256a.75.75,0,0,1-.75-.75v-1c0-.529.419-.818.862-1.124.623-.43,1.138-.83,1.138-1.376A1.209,1.209,0,0,0,12,8.756a1.252,1.252,0,0,0-1.25,1.25.75.75,0,0,1-1.5,0A2.753,2.753,0,0,1,12,7.256a2.721,2.721,0,0,1,2.75,2.75,3.3,3.3,0,0,1-1.786,2.61c-.079.055-.152.1-.214.147v.743A.75.75,0,0,1,12,14.256Z"/>
            <path d="M12,5a7,7,0,1,1-7,7,7.008,7.008,0,0,1,7-7m0-2a9,9,0,1,0,9,9,9,9,0,0,0-9-9Z"/>
          </svg>
        </el-tooltip>
      </span>
      <svg
        v-show="showCollapsibleArrow"
        :class="showContent ? 'arrow-down' : 'arrow-up'"
        class="ml-8 arrow-icon"
        height="15"
        width="15"
        viewBox="0 0 24 24"
      >
        <polygon points="12,7.5 4,16.1 20,16.1" />
      </svg>
    </div>
    <div v-show="showContent" class="label-content-container">
      <slot />
    </div>
  </div>
</template>

<script>
import { isEmpty } from 'ramda'

export default {
  name: 'DropdownLabel',

  props: {
    label: {
      type: String,
      default: ''
    },
    collapseByDefault: {
      type: Boolean,
      default: false
    },
    showCollapsibleArrow: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    tooltip: {
      type: String,
      default: ""
    }
  },

  data() {
    return {
      collapsed: this.collapseByDefault
    }
  },
  computed: {
    showContent: function() {
      return !(this.collapsed || this.disabled)
    },
    showHelpIcon: function() {
      return !isEmpty(this.tooltip)
    }
  },
  methods: {
    onArrowClicked() {
      if (this.showCollapsibleArrow && !this.disabled) {
        this.collapsed = !this.collapsed
      }
      return this.collapsed
    },
    setCollapsed(isCollapsed) {
      this.collapsed = isCollapsed
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/_variables.scss';

.label-content-container {
  background-color: #FAFBFC
}

.arrow-down {
  transform: rotate(180deg);
}

.arrow-icon {
  fill: currentColor;
}

.label-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0;
  margin-top: 0;
  padding: 0.5rem 1rem;
  align-items: center;
  text-transform: uppercase;
  cursor: default;
  svg {
    cursor: pointer
  }
}

.label-header-clickable {
  cursor: pointer;
}

.label-title {
  font-size: 1em;
  line-height: 1.5rem;
  font-weight: 500;
}

.help-icon {
  fill: $purple;
  vertical-align: text-top;
}

:deep(hr) {
  border: none;
  border-bottom: 1px solid $lineColor2;
  margin: 0;
}

.disabled {
  opacity: 0.5;
  background-color: #FAFBFC;
}
</style>
