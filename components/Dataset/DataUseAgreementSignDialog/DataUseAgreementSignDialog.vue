<template>
  <el-dialog
    :visible="visible"
    :show-close="false"
    @close="close"
    @closed="resetDialog"
  >
    <bf-dialog-header slot="title" :title="dialogTitle" />

    <div class="bf-dialog-body">
      <div class="agreement-wrap">
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="col-xs-12 col-md-8 description-container"
          v-html="parsedMarkdown"
        />
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-checkbox
        v-if="isSigningAgreement"
        v-model="isAgreementChecked"
        class="mb-16"
      >
        I agree to the terms and conditions of this data use agreement.
      </el-checkbox>
      <div class="button-wrap">
        <bf-button class="secondary" @click="close">
          Cancel
        </bf-button>
        <bf-button
          v-if="isSigningAgreement"
          processing-text="Submitting"
          :disabled="!isAgreementChecked"
          :processing="isProcessing"
          @click="submit"
        >
          Submit and Sign
        </bf-button>
        <bf-button
          v-if="!isSigningAgreement"
          processing-text="Downloading"
          :processing="isProcessing"
          @click="download"
        >
          Download
        </bf-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import BfButton from '~/components/Shared/BfButton/BfButton.vue'
import BfDialogHeader from '~/components/Shared/BfDialogHeader/BfDialogHeader.vue'
import {marked} from 'marked'

marked.setOptions({
  gfm: true
})

export default {
  name: 'DataUseAgreementSignDialog',

  components: {
    BfButton,
    BfDialogHeader
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    dataUseAgreement: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isSigningAgreement: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isAgreementChecked: false,
      isProcessing: false,
      marked
    }
  },

  computed: {
    /**
     * Compute dialog title based on if the user is signing
     * @returns {String}
     */
    dialogTitle() {
      return this.isSigningAgreement
        ? 'Sign Data Use Agreement'
        : this.dataUseAgreement.name
    },

    /**
     * Parses the markdown text
     */
    parsedMarkdown() {
      return marked(this.dataUseAgreementBody)
    },

    dataUseAgreementBody() {
      return this.replaceAllSlashEscapedSequences(this.dataUseAgreement.body)
    },
  },

  methods: {
    /**
     * Emit event to update the synced property
     */
    close() {
      this.$emit('update:visible', false)
      this.$emit('update:isSigningAgreement', false)
    },

    /**
     * Reset the dialog
     */
    resetDialog() {
      this.isProcessing = false
      this.isAgreementChecked = false
    },

    /**
     * Submit and request access
     */
    submit() {
      this.isProcessing = true
      this.$emit('submit', this.dataUseAgreement.id)
    },

    /**
     * Download agreement
     */
    download() {
      this.isProcessing = true
      this.$emit('download', this.dataUseAgreement.id)
    },

    replaceAllSlashEscapedSequences(sourceString){
      var result = ''
      var remaining = sourceString

      if (remaining) {
        var cutPoint = 0
        var index = remaining.indexOf("\\")
        while (index >= 0){
          var nextChar = remaining[index+1]
          var append = ''
          if (nextChar === 'n') {
            append = '\n'
          } else if (nextChar === 't') {
            append = '\t'
          }
          var slice = remaining.slice(cutPoint,index)
          result = result.concat(slice)
          result = result.concat(append)
          remaining = remaining.slice(index+2)
          index = remaining.indexOf("\\")
        }
        if (remaining.length > 0) {
          result = result.concat(remaining)
        }
      }

      return result
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variables';
:deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}
.dialog-footer {
  flex-direction: column;
}
:deep(.el-dialog__body) {
  flex: 1;
  overflow: scroll;
}
.button-wrap {
  display: flex;
}

// Markdown styles
.description-container {
  color: #000;
  font-size: 16px;
  line-height: 24px;
  padding-top: 32px;
  white-space: pre-wrap;
}

//  ::v-deep {
//    h1,
//    p,
//    h2,
//    h3,
//    blockquote,
//    h4,
//    pre {
//      max-width: 616px;
//    }
//
//    h1,
//    h2,
//    h3,
//    h4,
//    h5 {
//      margin: 0 0 8px;
//    }
//
//    h1 {
//      font-size: 32px;
//      font-weight: bold;
//      line-height: 40px;
//    }
//
//    p {
//      margin-bottom: 16px;
//    }
//
//    img {
//      height: auto;
//      max-width: 170%;
//      margin-bottom: 20px;
//      flex-basis: 50%;
//      margin-top: 24px;
//    }
//
//    h2 {
//      font-size: 24px;
//      font-weight: bold;
//      line-height: 32px;
//    }
//
//    h3 {
//      font-size: 20px;
//      font-weight: bold;
//      line-height: 24px;
//      letter-spacing: 0px;
//    }
//
//    h4 {
//      font-size: 16px;
//      font-weight: bold;
//      line-height: 24px;
//      text-transform: uppercase;
//      letter-spacing: 0px;
//    }
//
//    ul {
//      margin: 0 0 16px;
//      padding: 0 0 0 18px;
//    }
//
//    blockquote {
//      font-weight: normal;
//      line-height: 24px;
//      font-size: 16px;
//      border-left: 8px solid $dopamine-dark;
//      margin-left: 0;
//
//      p {
//        margin-left: 16px;
//      }
//    }
//    pre {
//      background-color: #f1f1f3;
//      line-height: 24px;
//      padding: 16px;
//
//      code {
//        font-weight: normal;
//        font-size: 14px;
//      }
//    }
//  }
//}
</style>
