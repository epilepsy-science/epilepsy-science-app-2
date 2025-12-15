import axios from "axios"
import { ref } from 'vue'

function createClient() {
  return axios.create({})
}

export default defineNuxtPlugin(() => {
  const apiClient = ref(createClient())
  const updateApiClient = (client) => {
    apiClient.value = client
  }
  return {
    provide: {
      pennsieveApiClient: apiClient,
      updatePennsieveApiClient: updateApiClient
    },
  }
})
