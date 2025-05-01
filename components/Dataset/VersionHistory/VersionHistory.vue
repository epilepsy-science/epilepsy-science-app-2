<script setup>

import BfDialogHeader from "~/components/Shared/BfDialogHeader/BfDialogHeader.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },

  datasetId: {
    type: Number,
    default: 0
  },

  latestVersion: {
    type: Number,
    default: 0
  },
  versions: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['close-version-dialog']);

function closeDialog() {
  emit('close-version-dialog')
}


</script>

<template>
  <div>
    <el-dialog
      :modelValue="visible"
      @update:modelValue="visible = $event"
      :show-close="false"
      class="version-history-dialog"
      width="772px"
      height="600px"
      @close="closeDialog"
    >
      <template #header>
        <bf-dialog-header title="Version History" @close="closeDialog" />
      </template>

      <div class="version-history-container">
        <div class="row table-header">
          <div class="col-xs-3">
            Version
          </div>
          <div class="col-xs-3">
            Date Published
          </div>
          <div class="col-xs-5 col-xs-offset-1">
            DOI
          </div>
        </div>
        <div
          v-for="version in versions"
          :key="version.doi"
          class="row table-rows"
        >
          <div class="col-xs-3">
            <nuxt-link
              :to="{
              name: 'version',
              params: {
                version: version.version,
                datasetId
              }
            }"
              @click.native="$emit('update:visible', false)"
            >
              Version {{ version.version }}
            </nuxt-link>
          </div>
          <div class="col-xs-3">
            {{ useFormatDate(version.versionPublishedAt) }}
          </div>
          <div class="col-xs-5 col-xs-offset-1">
            {{ version.doi }}
          </div>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<style lang="scss" scoped>

:deep(.el-dialog) {
  padding: 0;
  height: 350px;
  .el-dialog__header {
    background-color: #f1f1f3;
    padding-top: 16px;
    border-radius: 4px 4px 0px 0px;
    padding-bottom: 8px;

    .bf-dialog-header {
      .bf-dialog-header-title {
        font-size: 14px;
        font-weight: bold;
        line-height: 16px;
      }

      .icon-close {
        margin-bottom: 5px;
        .svg-icon {
          width: 16px !important;
          height: 16px !important;
        }
      }
    }
  }
  .el-dialog__body {
    padding: 0px 0px;
    overflow: scroll;
  }
}

.version-history-dialog {


  .version-history-container {
    height: 290px;

    .table-header {
      background-color: #f9f9f9;
      height: 40px;
      padding-left: 24px;
      color: $purple_3;
      font-weight: 600;
      font-size: 14px;
      line-height: 16px;
      padding-top: 12px;
      margin-left: 0px !important;
    }

    .table-rows {
      height: 40px;
      padding-left: 24px;
      color: #000000;
      font-size: 14px;
      line-height: 16px;
      padding-top: 14px;
      border-top: solid 1px #dadada;
      margin-left: 0px !important;

      a {
        text-decoration: underline;

        &:focus {
          color: $purple_2;
        }
      }

      .doi-column {
        padding-left: 10px !important;
      }
    }
  }


}
</style>
