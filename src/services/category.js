import api from './api';

export async function getCategories() {
  const { data } = await api.get('/api/categories');
  return data;
}

export async function getCategoryById(id) {
  const categories = await getCategories();
  return categories.find((category) => category.id === Number(id)) || null;
}

export async function createCategory(category) {
  const { data } = await api.post('/api/categories', category);
  return data;
}

export async function updateCategory(id, category) {
  const { data } = await api.put(`/api/categories/${id}`, category);
  return data;
}

export async function deleteCategory(id) {
  await api.delete(`/api/categories/${id}`);
}
