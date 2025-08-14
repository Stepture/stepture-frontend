import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function createPrivateApi(cookie?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });

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

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status !== 401 ||
        originalRequest._retry ||
        error.response?.data?.message !== "Access token is missing or invalid"
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        try {
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return instance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      isRefreshing = true;

      try {
        // 1. Make the refresh token request
        const refreshResponse = await publicApi.post(
          "/auth/refresh-token",
          {},
          cookie ? { headers: { Cookie: cookie } } : {}
        );

        // 2. Extract the 'set-cookie' header(s) from the refresh response
        const newCookieHeaders = refreshResponse.headers["set-cookie"];

        if (newCookieHeaders && newCookieHeaders.length > 0) {
          const newCookie = newCookieHeaders.join("; ");
          instance.defaults.headers.common["Cookie"] = newCookie;
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Cookie: newCookie,
          };
        }

        processQueue();
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return instance;
}

const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getServerApi(cookie?: string) {
  const privateApi = createPrivateApi(cookie);
  return {
    public: {
      refreshToken: async () => {
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          {
            headers: cookie ? { Cookie: cookie } : {},
            timeout: 30000,
          }
        );
        return response.data;
      },
    },
    protected: {
      getMe: async (options: AxiosRequestConfig = {}) => {
        const config = { ...options };
        if (cookie) {
          config.headers = { ...(config.headers || {}), Cookie: cookie };
        }
        try {
          const response = await privateApi.get("/auth/me", config);
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
      getDocumentById: async (id: string, options: AxiosRequestConfig = {}) => {
        const config = { ...options };
        if (cookie) {
          config.headers = { ...(config.headers || {}), Cookie: cookie };
        }
        const response = await privateApi.get(`/documents/${id}`, config);
        return response.data;
      },

      getDocumentsByUser: async () => {
        try {
          if (cookie) {
            const response = await privateApi.get("/documents", {
              headers: { Cookie: cookie },
            });

            return response.data;
          }
          throw new Error("No cookie provided for user documents retrieval");
        } catch (error) {
          console.error("Error fetching documents:", error);
          throw error;
        }
      },
    },
  };
}
