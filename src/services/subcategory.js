import api from './api';

export async function createSubcategory(subcategory) {
  const { data } = await api.post('/api/subcategories', subcategory);
  return data;
}

export async function deleteSubcategory(id) {
  await api.delete(`/api/subcategories/${id}`);
}
