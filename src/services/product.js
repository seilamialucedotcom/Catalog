import api from './api';

const queryString = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
};

export async function getProducts(filters = {}) {
  const { data } = await api.get(`/api/products${queryString(filters)}`);
  return data;
}

export async function getProductById(id) {
  const products = await getProducts();
  return products.find((product) => product.id === Number(id)) || null;
}

export async function createProduct(product) {
  const { data } = await api.post('/api/products', product);
  return data;
}

export async function updateProduct(id, product) {
  const { data } = await api.put(`/api/products/${id}`, product);
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`/api/products/${id}`);
}
