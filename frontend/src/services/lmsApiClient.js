import { apiClient } from "./apiClient";

export const lmsApiClient = {
  auth: {
    async login(payload) {
      return apiClient.post("/auth/login", payload);
    },
  },
};
