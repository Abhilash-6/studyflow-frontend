
const API_URL = "https://studyflow-backend-clay.onrender.com/api/tasks";

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const taskService = {
  getAll: () => request(API_URL),
  create: (task) =>
    request(API_URL, {
      method: "POST",
      body: JSON.stringify(task),
    }),
  update: (id, task) =>
    request(`${API_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    }),
  delete: (id) =>
    request(`${API_URL}/${id}`, {
      method: "DELETE",
    }),
};
