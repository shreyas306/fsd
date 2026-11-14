const TOKEN_KEY = "dtc_auth_token";
function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}
async function request(endpoint, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "An unexpected temporal anomaly occurred.");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}
const api = {
  // Authentication
  auth: {
    register: (payload) => request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    login: (payload) => request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    googleLogin: (payload) => request("/auth/google", {
      method: "POST",
      body: JSON.stringify(payload || {})
    }),
    me: () => request("/auth/me"),
    updateProfile: (payload) => request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
    changePassword: (payload) => request("/auth/password", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
    forgotPassword: (email) => request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    }),
    getDemoAccounts: () => request("/auth/demo-accounts")
  },
  // Capsules
  capsules: {
    list: (params) => {
      const q = new URLSearchParams();
      if (params?.status) q.append("status", params.status);
      if (params?.category) q.append("category", params.category);
      if (params?.search) q.append("search", params.search);
      if (params?.sort) q.append("sort", params.sort);
      return request(`/capsules?${q.toString()}`);
    },
    get: (id) => request(`/capsules/${id}`),
    create: (payload) => request("/capsules", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    update: (id, payload) => request(`/capsules/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
    seal: (id) => request(`/capsules/${id}/seal`, {
      method: "POST"
    }),
    forceUnlock: (id) => request(`/capsules/${id}/force-unlock`, {
      method: "POST"
    }),
    openSeal: (id) => request(`/capsules/${id}/open-seal`, {
      method: "POST"
    }),
    reschedule: (id, new_unlock_at) => request(`/capsules/${id}/reschedule`, {
      method: "POST",
      body: JSON.stringify({ new_unlock_at })
    }),
    archive: (id) => request(`/capsules/${id}/archive`, {
      method: "POST"
    }),
    delete: (id) => request(`/capsules/${id}`, {
      method: "DELETE"
    }),
    getOpeningExperience: (id) => request(`/capsules/${id}/opening`)
  },
  // Memories
  memories: {
    listForCapsule: (capsuleId) => request(`/capsules/${capsuleId}/memories`),
    upload: (capsuleId, formData) => request(`/capsules/${capsuleId}/memories`, {
      method: "POST",
      body: formData
    }),
    addMediaUrl: (capsuleId, payload) => request(`/capsules/${capsuleId}/memories`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    delete: (memoryId) => request(`/memories/${memoryId}`, {
      method: "DELETE"
    }),
    toggleFavorite: (memoryId) => request(`/memories/${memoryId}/favorite`, {
      method: "PATCH"
    }),
    gallery: (params) => {
      const q = new URLSearchParams();
      if (params?.type) q.append("type", params.type);
      if (params?.search) q.append("search", params.search);
      if (params?.favoriteOnly) q.append("favoriteOnly", "true");
      return request(`/memories/gallery?${q.toString()}`);
    }
  },
  // Letters
  letters: {
    get: (capsuleId) => request(`/capsules/${capsuleId}/letter`),
    save: (capsuleId, payload) => request(`/capsules/${capsuleId}/letter`, {
      method: "POST",
      body: JSON.stringify(payload)
    })
  },
  // Collaboration
  collaboration: {
    invite: (capsuleId, payload) => request(`/capsules/${capsuleId}/invite`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    verifyInvitation: (token) => request(`/invitations/verify/${token}`),
    acceptInvitation: (token) => request(`/invitations/${token}/accept`, {
      method: "POST"
    }),
    getShared: () => request(
      "/capsules-shared"
    )
  },
  // Social & Explore
  explore: {
    list: (params) => {
      const q = new URLSearchParams();
      if (params?.category) q.append("category", params.category);
      if (params?.search) q.append("search", params.search);
      if (params?.filter) q.append("filter", params.filter);
      return request(`/explore?${q.toString()}`);
    },
    toggleLike: (capsuleId) => request(`/capsules/${capsuleId}/like`, {
      method: "POST"
    }),
    toggleBookmark: (capsuleId) => request(`/capsules/${capsuleId}/bookmark`, {
      method: "POST"
    }),
    getComments: (capsuleId) => request(`/capsules/${capsuleId}/comments`),
    addComment: (capsuleId, content) => request(`/capsules/${capsuleId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content })
    }),
    report: (capsuleId, payload) => request(`/capsules/${capsuleId}/report`, {
      method: "POST",
      body: JSON.stringify(payload)
    })
  },
  // Notifications
  notifications: {
    list: () => request("/notifications"),
    markRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () => request("/notifications/mark-all-read", { method: "POST" })
  },
  // Dashboard Stats
  dashboard: {
    getStats: () => request("/dashboard/stats")
  },
  // Admin
  admin: {
    getOverview: () => request("/admin/overview"),
    getUsers: () => request("/admin/users"),
    toggleSuspendUser: (userId) => request(`/admin/users/${userId}/suspend`, {
      method: "PATCH"
    }),
    getCapsules: () => request("/admin/capsules"),
    getReports: () => request("/admin/reports"),
    updateReport: (reportId, status) => request(`/admin/reports/${reportId}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }),
    getLogs: () => request("/admin/logs")
  }
};
export {
  api,
  getStoredToken,
  setStoredToken
};
