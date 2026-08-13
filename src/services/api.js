// All Express routes are mounted below /api. Vite exposes only VITE_* variables.
const BASE_URL = import.meta.env.VITE_API_URL || 'https://back-catalog.vercel.app';

const request = async (method, path, body) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('catalog_jwt');
  if (token) headers.Authorization = `Bearer ${token}`;

  console.log(`[API] ${method} ${BASE_URL}${path}`);
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const error = new Error(data?.message || `HTTP ${res.status}`);
    error.response = { status: res.status, data };
    throw error;
  }

  return { data };
};

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path)
};

export default api;
export { request };
