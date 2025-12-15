<script setup>
import {reactive} from "vue";
import {useReCaptcha} from "vue-recaptcha-v3";
import BfDialogHeader from "~/components/Shared/BfDialogHeader/BfDialogHeader.vue";
import BfButton from "~/components/Shared/BfButton/BfButton.vue";

const runtimeConfig = useRuntimeConfig()
const recaptchaInstance = useReCaptcha();
const recaptcha = async () => {
  // optional you can await for the reCaptcha load
  await recaptchaInstance?.recaptchaLoaded();

  // get the token, a custom action could be added as argument to the method
  return recaptchaInstance?.executeRecaptcha('yourActionHere');
};


const emit = defineEmits(['close-rehydration-dialog']);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 0
  },
  datasetId: {
    type: Number,
    default: 0
  },
  closeRehydrationDialog: {
    type: Function,
    default: () => {}
  }
})

const rehydrationForm = reactive({
    userName: '',
    email: ''
})

const rehydrationRules = reactive({
  userName: [
    {
      required: true,
      message: 'Please enter your full name',
      trigger: 'blur'
    }
  ],
  email: [
    {
      required: true,
      message: 'Please enter a valid email',
      trigger: 'blur',
      type: 'email'
    }
  ]
})

const form = useTemplateRef('rehForm')

function clearForm() {
  form?.value.resetFields()
}

/**
 * Closes dialog
 */
function closeDialog() {
  clearForm()
  emit('close-rehydration-dialog')
}

function onFormSubmit(e) {
  console.log(e)
  form?.value.validate((valid) => {
    if (!valid) {
      return
    }
    submitRehydrationRequest()
  })
}

/**
 * Click Handler for submit rehydration request button
 */
async function submitRehydrationRequest() {
  const recaptchaToken = await recaptcha();

  const url = `${runtimeConfig.public.api2_host}/discover/rehydrate`

  useSendXhr(url, {
    method: 'POST',
    body: {
      datasetVersionId: props.version,
      datasetId: props.datasetId,
      name: rehydrationForm.userName,
      email: rehydrationForm.email,
      recaptchaToken: recaptchaToken
    }
  }).then((data) => {
    if (data) {
      ElMessage({
        message: `Your request has been successfully submitted.`,
        type: 'info',
      })
    }
  })
  closeDialog()
}

</script>

<template>
  <div class="request-access-dialog">
    <el-dialog
      :modelValue="visible"
      :show-close="false"
      @close="closeDialog"
    >
      <template #header>
        <bf-dialog-header  title="Request Access" @close="closeDialog"/>

      </template>
      <div class="rehydration-modal-container">
        <div class="copy-container">
          <h2>
            You are requesting access to version {{ version }} of this dataset.
          </h2>
          <p class="paragraph">
            After submitting your request, the dataset version will be temporarily
            accessible in an S3 folder. You'll receive an email from
            support@pennsieve.io once the restoration is complete, within 24
            hours. Access lasts for 14 days before automatic removal. Further
            details are available on the
            <a
              href="https://docs.pennsieve.io/docs/requesting-rehydration-of-a-public-dataset"
            >Pennsieve Documentation Hub</a
            >.
          </p>
        </div>
        <p class="paragraph support-msg">
          Please contact Pennsieve Support at
          <a href="mailto:support@pennsieve.io">support@pennsieve.io</a> if you
          have any questions.
        </p>
        <el-form
          id="rehydration-request-form"
          ref="rehForm"
          :model="rehydrationForm"
          :rules="rehydrationRules"
          hide-required-asterisk
          @submit.prevent
        >
          <el-form-item label="Full Name" prop="userName">
            <el-input
              v-model="rehydrationForm.userName"
              class="full-name-input"
              autofocus
            ></el-input>
          </el-form-item>
          <el-form-item label="Email" prop="email">
            <el-input v-model="rehydrationForm.email" />
          </el-form-item>
        </el-form>
        <bf-button :prevent-click-event="true" @click="onFormSubmit">Submit</bf-button>
      </div>
    </el-dialog>

  </div>
</template>


<style scoped lang="scss">

.request-access-dialog {
  margin: 20px;
  padding: 40px;
}

.el-form-item__label {
  color: $text-color;
  font-weight: 500;
  line-height: 16px;
  margin-bottom: 8px;
}

.el-form-item {
  margin-bottom: 16px;
  &.is-error {
    margin-bottom: 32px;
  }
}

.copy-container {
  word-break: break-word;
}

.paragraph {
  word-break: break-word;
}

.support-msg,
h2 {
  margin-bottom: 16px;
}
</style>
