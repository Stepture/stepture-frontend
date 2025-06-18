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
        console.log(
          "[axios-server] Token refresh in progress, queuing request"
        );
        try {
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          console.log("[axios-server] Token refresh done, retrying request");
          return instance(originalRequest);
        } catch (err) {
          console.log("[axios-server] Token refresh failed for queued request");
          return Promise.reject(err);
        }
      }

      isRefreshing = true;
      console.log("[axios-server] Starting token refresh");

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
          // Join multiple set-cookie headers into a single string for the 'Cookie' header
          const newCookie = newCookieHeaders.join("; ");
          console.log(
            "[axios-server] Token refresh successful, updating cookie."
          );

          // 3. Update the default 'Cookie' header for this axios instance
          // This ensures all *future* requests made with this 'instance' use the new cookie.
          instance.defaults.headers["Cookie"] = newCookie;

          // 4. Update the 'Cookie' header in the *original failed request*
          // This ensures the *retried* request uses the new cookie immediately.
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Cookie: newCookie,
          };
        } else {
          console.log(
            "[axios-server] Token refresh successful, but no 'set-cookie' header was found in response."
          );
          // You might want to handle this case, as it means the server didn't issue a new cookie
        }

        processQueue(); // Unblock any queued requests
        return instance(originalRequest); // Retry the original request with the new cookie
      } catch (refreshError) {
        console.log("[axios-server] Token refresh failed");
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        console.log("[axios-server] Token refresh process ended");
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
        const response = await publicApi.post(
          "/auth/refresh-token",
          {},
          cookie ? { headers: { Cookie: cookie } } : {}
        );
        return response.data;
      },
    },
    protected: {
      getMe: async (options: AxiosRequestConfig = {}) => {
        const config = { ...options };
        if (cookie) {
          // This part relies on the initial cookie passed to createPrivateApi
          // The interceptor handles subsequent updates.
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
    },
  };
}
