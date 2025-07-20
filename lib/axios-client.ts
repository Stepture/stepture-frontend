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
  timeout: 10000,
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
