import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {"Content-Type": "application/json"},
});

// --- Token management ---
let authToken: string | null = localStorage.getItem("authToken");
let refreshToken: string | null = localStorage.getItem("refreshToken");

export function setTokens(auth: string, refresh: string) {
  authToken = auth;
  refreshToken = refresh;
  localStorage.setItem("authToken", auth);
  localStorage.setItem("refreshToken", refresh);
}

export function clearTokens() {
  authToken = null;
  refreshToken = null;
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
}

export function getAuthToken() {
  return authToken;
}

export function getRefreshToken() {
  return refreshToken;
}

// --- Axios interceptors ---

// Attach auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If it's a login/refresh request, don't retry
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: currentRefreshToken,
        });
        const newAuthToken = res.data.authToken;
        setTokens(newAuthToken, currentRefreshToken);
        processQueue(null, newAuthToken);
        originalRequest.headers.Authorization = `Bearer ${newAuthToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// --- Auth API ---
export const authApi = {
  login: (data: {email: string; password: string}) =>
    axios
      .post(`${API_BASE_URL}/auth/login`, data)
      .then((r) => r.data),
  refresh: (refreshTokenValue: string) =>
    axios
      .post(`${API_BASE_URL}/auth/refresh`, {refreshToken: refreshTokenValue})
      .then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

// Customers
export const customersApi = {
  getAll: () => api.get("/customers").then((r) => r.data),
  getById: (id: string) => api.get(`/customers/${id}`).then((r) => r.data),
  create: (data: {name: string; cif: string}) =>
    api.post("/customers", data).then((r) => r.data),
  update: (id: string, data: Partial<{name: string; cif: string}>) =>
    api.put(`/customers/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/customers/${id}`).then((r) => r.data),
};

// Projects
export const projectsApi = {
  getAll: () => api.get("/projects").then((r) => r.data),
  getById: (id: string) => api.get(`/projects/${id}`).then((r) => r.data),
  create: (data: {name: string; customerId: string}) =>
    api.post("/projects", data).then((r) => r.data),
  update: (id: string, data: Partial<{name: string; customerId: string}>) =>
    api.put(`/projects/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/projects/${id}`).then((r) => r.data),
};

// Materials
export const materialsApi = {
  getAll: () => api.get("/materials").then((r) => r.data),
  getById: (id: string) => api.get(`/materials/${id}`).then((r) => r.data),
  create: (data: {name: string}) =>
    api.post("/materials", data).then((r) => r.data),
  update: (id: string, data: {name: string}) =>
    api.put(`/materials/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/materials/${id}`).then((r) => r.data),
};

// Services
export const servicesApi = {
  getAll: () => api.get("/services").then((r) => r.data),
  getById: (id: string) => api.get(`/services/${id}`).then((r) => r.data),
  create: (data: {name: string}) =>
    api.post("/services", data).then((r) => r.data),
  update: (id: string, data: {name: string}) =>
    api.put(`/services/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/services/${id}`).then((r) => r.data),
};

// Vehicles
export const vehiclesApi = {
  getAll: () => api.get("/vehicles").then((r) => r.data),
  getById: (id: string) => api.get(`/vehicles/${id}`).then((r) => r.data),
  create: (data: {name: string; plate: string}) =>
    api.post("/vehicles", data).then((r) => r.data),
  update: (id: string, data: Partial<{name: string; plate: string}>) =>
    api.put(`/vehicles/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/vehicles/${id}`).then((r) => r.data),
};

// Workers
export const workersApi = {
  getAll: () => api.get("/workers").then((r) => r.data),
  getById: (id: string) => api.get(`/workers/${id}`).then((r) => r.data),
  create: (data: {
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
  }) => api.post("/workers", data).then((r) => r.data),
  update: (
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      dni: string;
      email: string;
    }>,
  ) => api.put(`/workers/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/workers/${id}`).then((r) => r.data),
};

// Delivery Notes
export const deliveryNotesApi = {
  getAll: (params?: Record<string, string>) =>
    api.get("/delivery-notes", {params}).then((r) => r.data),
  getById: (id: string) =>
    api.get(`/delivery-notes/${id}`).then((r) => r.data),
  create: (data: unknown) =>
    api.post("/delivery-notes", data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    api.put(`/delivery-notes/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`/delivery-notes/${id}`).then((r) => r.data),
};

// Users
export const usersApi = {
  getAll: () => api.get("/users").then((r) => r.data),
  getById: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  create: (data: {email: string; password: string; name: string}) =>
    api.post("/users", data).then((r) => r.data),
  update: (
    id: string,
    data: Partial<{email: string; password: string; name: string}>,
  ) => api.put(`/users/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
};

export default api;
