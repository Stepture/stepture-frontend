import axios from "axios";
// import { apiClient } from "@/lib/axios-client";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const privateApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

async function refreshToken() {
  await privateApi.post("/auth/refresh-token");
}

let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 1;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
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
  if (!error) {
    refreshAttempts = 0; // Reset attempts on success
  }
};

privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      refreshAttempts >= MAX_REFRESH_ATTEMPTS
    ) {
      if (originalRequest.url?.includes("/auth/refresh-token")) {
        refreshAttempts = 0;
        isRefreshing = false;
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      refreshAttempts++;

      try {
        await refreshToken();
        processQueue();
        return privateApi(originalRequest);
      } catch (refreshError) {
        refreshAttempts = 0;
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
    // Add public endpoints here if needed
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
    logout: async () => {
      await privateApi.post("/auth/logout");
    },
  },
};
