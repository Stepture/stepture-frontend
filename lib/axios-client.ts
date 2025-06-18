import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const privateApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

async function refreshToken() {
  await publicApi.post("/auth/refresh-token", {}, { withCredentials: true });
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
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      error.response?.data?.message !== "Access token has expired"
    ) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    if (isRefreshing) {
      try {
        await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        return privateApi(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
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
  }
);

export const apiClient = {
  public: {
    refreshToken: async () => {
      const response = await publicApi.post(
        "/auth/refresh-token",
        {},
        { withCredentials: true }
      );
      return response.data;
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
