import { EditCaptureRequest } from "@/app/document/document.types";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const refreshApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const privateApi = axios.create({
  baseURL: BASE_URL,
  timeout: 100000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

async function refreshToken() {
  await refreshApi.post("/auth/refresh-token");
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        await refreshToken();
        processQueue();
        return privateApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(privateApi(originalRequest)),
          reject,
        });
      });
    }
  }
);

export const apiClient = {
  public: {
    uploadImageToGoogleApi: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await publicApi.post(
          "/google-drive/upload-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    getDocumentById: async (id: string) => {
      try {
        const response = await publicApi.get(`/documents/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  },
  protected: {
    getMe: async (options = {}) => {
      try {
        const response = await privateApi.get("/auth/me", options);
        return response.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return { user: null };
        }
        throw error;
      }
    },
    uploadImageToGoogleApi: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await privateApi.post(
          "/google-drive/upload-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    updateDocument: async (id: string, data: EditCaptureRequest) => {
      try {
        const response = await privateApi.put(`/documents/${id}`, data);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    getDocumentById: async (id: string) => {
      try {
        const response = await privateApi.get(`/documents/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    updateDocumentShareStatus: async (id: string, isPublic: boolean) => {
      try {
        const response = await privateApi.patch(`/documents/${id}/sharing`, {
          isPublic,
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    logout: async () => {
      await privateApi.post("/auth/logout");
    },
    // BYOK API Key management
    storeApiKey: async (payload: {
      encryptedKey: string;
      salt: string;
      iv: string;
      hash: string;
    }) => {
      const response = await privateApi.post("/users/api-key", payload);
      return response.data;
    },
    getApiKey: async () => {
      const response = await privateApi.get("/users/api-key");
      return response.data;
    },
    getApiKeyStatus: async () => {
      const response = await privateApi.get("/users/api-key/status");
      return response.data;
    },
    deleteApiKey: async () => {
      await privateApi.delete("/users/api-key");
    },
    saveDocument: async (id: string) => {
      try {
        const response = await privateApi.post(`/documents/${id}/save`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    checkSavedStatus: async (id: string) => {
      try {
        const response = await privateApi.get(`/documents/${id}/save-status`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    unsaveDocument: async (id: string) => {
      try {
        const response = await privateApi.delete(`/documents/${id}/save`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    deleteDocument: async (id: string) => {
      try {
        const response = await privateApi.delete(`/documents/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    restoreDeletedDocument: async (id: string) => {
      try {
        const response = await privateApi.post(`/documents/${id}/restore`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    deleteDocumentPermanently: async (id: string) => {
      try {
        const response = await privateApi.delete(`/documents/${id}/permanent`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    restoreDocument: async (id: string) => {
      try {
        const response = await privateApi.put(`/documents/${id}/restore`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  },
};
