<template>
  <div class="collaborator-form">
    <el-form ref="form" :model="collaboratorForm" class="form-wrapper">
      <el-row :gutter="20" class="form-row">
        <el-col :span="12">
          <el-form-item>
            <el-input v-model="collaboratorForm.name" placeholder="Name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <el-input v-model="collaboratorForm.email" placeholder="Email" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-input
          v-model="collaboratorForm.message"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 6 }"
          placeholder="What would you like to share with us?"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="submit-button" @click="onSubmit">Submit</el-button>
      </el-form-item>
    </el-form>
    <div class="email-link">
      Or just send us an <a href="mailto:support@pennsieve.com">email</a>.
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const collaboratorForm = ref({
  name: "",
  email: "",
  message: "",
});

const onSubmit = () => {
  console.log("Form Submitted:", form.value);
};
</script>

<style lang="scss">
.collaborator-form {
  max-width: 500px;
  margin: 0 auto;

  .form-row {
    justify-content: space-between;
  }

  .el-input, textarea {
    border: 1px solid #4598E1;
    border-radius: 5px;
    color: #4598E1;

    input::placeholder {
      color: #4598E1;
    }
  }

  textarea::placeholder {
    color: #4598E1;
  }

  .submit-button {
    background-color: #4598E1;
    color: white;
    width: 100%;
    font-weight: bold;

    &:hover {
      background-color: white;
      color: #4598E1;
    }
  }

  .email-link {
    margin-top: 10px;
    text-align: center;
    color: #4598E1;

    a {
      color: #4598E1;
      text-decoration: underline;
    }
  }
}
</style>