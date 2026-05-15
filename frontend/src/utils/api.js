import apiService from "../services/api";

// Backward-compatible shim.
// Existing code imports `../utils/api`.
// Canonical implementation now lives in `frontend/src/services/api.js`.
export default apiService;

