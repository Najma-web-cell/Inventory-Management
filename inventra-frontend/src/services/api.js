// Tiny fetch wrapper: base URL, JWT header, JSON/FormData handling, error normalisation.
const BASE = '/api/v1';
const KEY = 'inventra_token';

export const tokenStore = {
  get: () => localStorage.getItem(KEY) || sessionStorage.getItem(KEY),
  set: (token, remember) => {
    (remember ? localStorage : sessionStorage).setItem(KEY, token);
  },
  clear: () => { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); },
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(path, { method = 'GET', body, raw } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running on port 5000?');
  }

  if (raw && res.ok) return res;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

const qs = (params = {}) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
  return s ? `?${s}` : '';
};

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me'),
  stats: () => request('/dashboard/stats'),

  products: (params) => request(`/products${qs(params)}`),
  saveProduct: (id, formData) => request(id ? `/products/${id}` : '/products', { method: id ? 'PUT' : 'POST', body: formData }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  categories: () => request('/categories'),
  saveCategory: (id, body) => request(id ? `/categories/${id}` : '/categories', { method: id ? 'PUT' : 'POST', body }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  suppliers: () => request('/suppliers'),
  saveSupplier: (id, body) => request(id ? `/suppliers/${id}` : '/suppliers', { method: id ? 'PUT' : 'POST', body }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),

  adjustStock: (body) => request('/stock/adjust', { method: 'POST', body }),
  logs: (params) => request(`/stock/logs${qs(params)}`),

  // Authenticated CSV download -> triggers a browser save
  download: async (kind) => {
    const res = await request(`/export/${kind}`, { raw: true });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `inventra-${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
