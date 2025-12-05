<script setup>
import { useMainStore } from "~/store/index.js";
import { ref, onMounted, computed, watch, shallowRef } from "vue";
import { Markdown, TextViewer } from "pennsieve-visualization";

// Dynamic imports for browser-only tsviewer
const TSViewer = shallowRef(null);
const viewerStore = shallowRef(null);

if (import.meta.client) {
  import("tsviewer/style");
  import("tsviewer").then((module) => {
    TSViewer.value = module.TSViewer;
    viewerStore.value = module.useViewerStore();
  });
}

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const store = useMainStore();
const packageFiles = ref([]);
const packageType = ref("");
const fileUri = ref("");
const isLoading = ref(true);
const isReady = ref(false);
const packageId = ref("");

const PackageFilesUrl = computed(() => {
  return `${runtimeConfig.public.discover_api_host}/packages/${route.params.id}/files`;
});
const viewerState = computed(() => {
  if (!packageType.value) {
    return { type: "processing", message: "Processing package information..." };
  }

  if (isLoading.value) {
    return { type: "loading", message: "Loading viewer..." };
  }

  // Handle Markdown
  if (packageType.value === "Markdown" || isMarkdownFile(fileUri.value)) {
    return { type: "markdown", message: null };
  }

  // Handle Text-based files
  if (isTextFile(fileUri.value)) {
    return {
      type: "text",
      message: null,
      fileType: getFileType(fileUri.value),
    };
  }

  // Handle TimeSeries
  if (packageType.value === "TimeSeries") {
    if (!isReady.value) {
      return {
        type: "error",
        message:
          "File is not processed, please try processing the timeseries file.",
      };
    }
    return { type: "timeseries", message: null };
  }

  return {
    type: "unsupported",
    message: "Viewer is not available for this file type.",
  };
});

async function setTSViewer() {
  const viewerConfig = {
    timeseriesDiscoverApi: runtimeConfig.public.ts_streaming_host_websocket,
    apiUrl: runtimeConfig.public.api_host,
    timeSeriesApi: runtimeConfig.public.ts_streaming_host_http,
  };
  viewerStore.value.setViewerConfig(viewerConfig);
  console.log(packageId.value);
  return await viewerStore.value.fetchAndSetActiveViewer({
    packageId: packageId.value,
  });
}
function getPackageFiles() {
  return useSendXhr(PackageFilesUrl.value, {
    header: {},
    method: "GET",
  })
    .then((response) => {
      packageFiles.value = response;
    })
    .then(() => {
      if (packageFiles.value.files.length > 0) {
        const firstFile = packageFiles.value.files[0];
        fileUri.value = firstFile.uri;

        // Get DatasetId and version from first file in package
        const expr = /s3:\/\/[a-z-0-9]+\/([0-9]+)\/(.*)/;
        const match = firstFile.uri.match(expr);
        const datasetId = match[1];
        store.setSelectedPackage({
          datasetId: datasetId,
          version: 1,
          files: packageFiles.value.files,
        });

        // Determine package type
        if (isMarkdownFile(firstFile.uri)) {
          packageType.value = "Markdown";
        } else {
          packageType.value = firstFile.packageType;
        }
        packageId.value = "N:collection:dd18bb32-c17d-4f89-a9c3-fdeca4c25c1e"; //firstFile.sourcePackageId;
        isLoading.value = false;
      }
    })
    .catch(() => {
      console.log("An error occurred getting the files for the package.");
    });
}

// FUNCTIONS HELPER
function isMarkdownFile(uri) {
  if (!uri) return false;
  const lowerUri = uri.toLowerCase();
  return lowerUri.endsWith(".md") || lowerUri.endsWith(".markdown");
}

function isTextFile(uri) {
  if (!uri) return false;
  const lowerUri = uri.toLowerCase();
  const textExtensions = [
    ".txt",
    ".csv",
    ".json",
    ".xml",
    ".log",
    ".yaml",
    ".yml",
  ];
  return textExtensions.some((ext) => lowerUri.endsWith(ext));
}

function getFileType(uri) {
  if (!uri) return "text";
  const lowerUri = uri.toLowerCase();
  if (lowerUri.endsWith(".csv")) return "csv";
  if (lowerUri.endsWith(".json")) return "json";
  if (lowerUri.endsWith(".xml")) return "xml";
  if (lowerUri.endsWith(".yaml") || lowerUri.endsWith(".yml")) return "yaml";
  return "text";
}

onMounted(async (to, from) => {
  try {
    if (route.params.id !== "details") {
      await getPackageFiles();
    }
    if (packageId.value) {
      await setTSViewer();
      isReady.value = true;
    }
  } catch (e) {
    console.error("Error during initialization:", e.message);
    isReady.value = false;
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="package-details">
    <package-details class="package-details-content" />

    <div class="package-viewer">
      <h3 class="viewer-title">{{ viewerState.type }} Viewer</h3>

      <div class="viewer-wrapper">
        <!-- Timeseries Viewer -->
        <client-only v-if="viewerState.type === 'timeseries'">
          <component :is="TSViewer" v-if="TSViewer" />
          <div v-else class="viewer-message">Loading viewer...</div>
        </client-only>

        <!-- Markdown Viewer -->
        <!-- <div
          v-else-if="viewerState.type === 'markdown'"
          class="markdown-viewer-container"
        >
          <div v-if="isLoadingContent" class="viewer-message">
            Loading markdown file...
          </div>
          <div
            v-else-if="contentError"
            class="viewer-message viewer-message--error"
          >
            Error loading file: {{ contentError }}
          </div>
          <div v-else class="markdown-viewer">
            <Markdown :markdownText="fileContent" :disabled="true" />
          </div>
        </div>
-->
        <!-- Text/CSV/JSON Viewer -->
        <!-- <div
          v-else-if="viewerState.type === 'text'"
          class="text-viewer-container"
        >
          <div v-if="isLoadingContent" class="viewer-message">
            Loading text file...
          </div>
          <div
            v-else-if="contentError"
            class="viewer-message viewer-message--error"
          >
            Error loading file: {{ contentError }}
          </div>
          <div v-else class="text-viewer-id">
            <TextViewer
              :content="fileContent"
              :file-type="viewerState.fileType"
              :show-line-numbers="true"
              max-height="70vh"
            />
          </div>
        </div> -->

        <!-- Status Messages -->
        <div v-else class="viewer-message">
          {{ viewerState.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.package-details {
  display: flex;
  flex-direction: column;
}

.pennsieve-viewer {
  display: flex;
}

.package-viewer {
  padding-inline: 2rem;
}

.viewer-title {
  color: $gray_4;
  font-size: 16px;
  font-weight: 500;
  line-height: 40px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.viewer-wrapper {
  min-height: 200px;
}

.viewer-message {
  padding: 2rem;
  text-align: center;
  color: $gray_4;

  &--error {
    color: #cf222e;
    background-color: #ffebe9;
    border-radius: 6px;
  }
}

.markdown-viewer-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.text-viewer-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.text-viewer-id {
  width: 100%;
  max-width: 1200px;
  overflow: auto;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  padding: 2rem;
  background-color: #ffffff;
}
:deep(.text-viewer__footer) {
  position: absolute;
}
</style>
