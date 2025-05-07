<template>
  <div class="dataset-list-controls">
    <div class="action-wrap">
      <el-dropdown
        class="mr-24"
        trigger="click"
        placement="bottom-start"
        @command="setPageSize"
        @visible-change="isPageSizeMenuOpen = $event"
      >
        <button class="el-dropdown-link">
          <span class="el-dropdown-text-link">
            Datasets per page {{ pageSize }}
          </span>
          <IconArrowUp
            :height="10"
            :width="10"
            :class="[this.isPageSizeMenuOpen ? 'svg-flip' : '']"
            />

        </button>
        <template #dropdown>
          <el-dropdown-menu class="bf-menu">
            <el-dropdown-item
              v-for="option in pageSizeOptions"
              :key="option"
              :command="option"
            >
              {{ option }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>

      </el-dropdown>

      <!--
      @TODO Add this feature back in when sorting is available in the endpoint
      <el-dropdown
        class="mr-24"
        trigger="click"
        placement="bottom-start"
        @command="setSortBy"
        @visible-change="isSortByMenuOpen = $event"
      >
        <button class="el-dropdown-link">
          <span class="el-dropdown-text-link">
            Sort by {{ sortBy.label }}
          </span>
          <svg-icon
            class="ml-8"
            name="icon-arrow-up"
            :dir="isSortByMenuOpen ? 'up' : 'down'"
            height="10"
            width="10"
          />
        </button>
        <el-dropdown-menu
          slot="dropdown"
          class="bf-menu"
        >
          <el-dropdown-item
            v-for="option in sortByOptions"
            :key="option.value"
            :command="option"
          >
            {{ option.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <button
        class="icon-sort"
        @click="setSortDir"
      >
        <svg-icon
          name="icon-sort"
          :class="[ sortIconDirection === 'down' ? 'svg-flip' : '' ]"
          color="currentColor"
          :dir="sortIconDirection"
          height="20"
          width="20"
        />
      </button> -->
    </div>
  </div>
</template>

<script>
import IconArrowUp from "~/components/Icons/IconArrowUp.vue";

export default {
  components: {IconArrowUp},
  props: {
    total: {
      type: Number,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 50
    },
    pageSizeOptions: {
      type: Array,
      default: () => {
        return [25, 50, 100]
      }
    }
  },

  data() {
    return {
      sortBy: {
        label: 'Name',
        value: 'name'
      },
      sortByOptions: [
        {
          label: 'Name',
          value: 'name'
        },
        {
          label: 'Last Updated',
          value: 'last-updated'
        }
      ],
      isSortByMenuOpen: false,
      isPageSizeMenuOpen: false,
      sortDir: 'asc'
    }
  },

  computed: {
    /**
     * Compute dataset icon sort direction
     * @returns {String}
     */
    sortIconDirection() {
      return this.sortDir === 'asc' ? 'up' : 'down'
    }
  },

  methods: {
    /**
     * Set pageSize on how many datasets to show per page
     * @param {Number} pageSize
     */
    setPageSize(pageSize) {
      this.$emit('update:pageSize', pageSize)
      this.$nextTick(() => {
        this.emitOptions()
      })
    },

    /**
     * Set how the datasets should be sorted
     * @param {Number} sortBy
     */
    setSortBy(sortBy) {
      this.sortBy = sortBy
      this.emitOptions()
    },

    /**
     * Set sort direction
     */
    setSortDir() {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      this.emitOptions()
    },

    /**
     * Emit the options
     */
    emitOptions() {
      this.$emit('set-list-options', {
        sortDir: this.sortDir,
        sortBy: this.sortBy,
        pageSize: this.pageSize
      })
    }
  }
}
</script>

<style lang="scss" scoped>

//@use '../../assets/css/components/el-dropdown.scss';
//@use '../../assets/css/components/el-select.scss';

.dataset-list-controls {
  align-items: center;
  display: flex;
  justify-content: space-between;
}
.icon-sort {
  &:hover,
  &:focus {
    color: $es-primary-color;
  }
}
:deep(.el-pagination) {
  padding: 0;
}
.action-wrap {
  align-items: center;
  display: flex;
  min-height: 24px;
}
.el-dropdown {
  flex-shrink: 0;
}
</style>
