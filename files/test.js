import apiClient from "./apiClient.js";

// All requests should run at the same time and produce only one request
// to the backend. All requests should return or reject.
function runTest() {
  const batchUrl = '/file-batch-api';
  const apiClientInstance = apiClient();
  // Should return [{id:'fileid1'},{id:'fileid2'}]
  apiClientInstance.get(batchUrl, {params: {ids: ['fileid1','fileid2']}}).then(
    response => console.log(`URL: ${response} \n{params: {ids: ['fileid1','fileid2']}\nShould return [{id:'fileid1'},{id:'fileid2'}]; value:`, response.data)
  );
  // Should return [{id:'fileid2'}]
  apiClientInstance.get(batchUrl, {params: {ids: ['fileid2']}}).then(
    response => console.log("\n{params: {ids: ['fileid2']}\nShould return [{id:'fileid2'}]; value:", response.data)
  );
  // Should reject as the fileid3 is missing from the response
  apiClientInstance.get(batchUrl, {params: {ids: ['fileid3']}}).then(
    response => console.log("\n{params: {ids: ['fileid3']}\nShould reject; value:", response.data)
  ).catch(err => console.warn("Rejected because of:", err));
}
runTest();
