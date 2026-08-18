import api from './api';

export async function getBrands() {
  const { data } = await api.get('/api/brands');
  return data;
}

export async function createBrand(brand) {
  const { data } = await api.post('/api/brands', brand);
  return data;
}
