// composables/useFileContent.js
export const useFileContent = () => {
  const runtimeConfig = useRuntimeConfig();

  /**
   * Fetches file content from S3 using the zipit service with authentication
   * @param {Object} file - File object with path, datasetId info
   * @param {Number} datasetId - Dataset ID
   * @param {Number} version - Dataset version
   * @returns {Promise<string>} File content as text
   */
  async function fetchFileContent(file, datasetId, version) {
    try {

      // Extract path from URI if path property doesn't exist
      let filePath = file.path;
      if (!filePath && file.uri) {
        // Extract path from S3 URI: s3://bucket/datasetId/path/to/file
        const expr = /s3:\/\/[a-z-0-9]+\/[0-9]+\/(.*)/;
        const match = file.uri.match(expr);
        filePath = match ? match[1] : file.uri;
      }

      // Build payload with nested data structure
      const payload = {
        data: {
          paths: [filePath],
          datasetId: datasetId,
          version: version,
        },
      };

      // Call zipit service to get the file
      const response = await fetch(runtimeConfig.public.zipit_host, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      // Return as text
      return await response.text();
    } catch (error) {
      console.error("Error fetching file content:", error);
      throw error;
    }
  }

  return {
    fetchFileContent,
  };
};
