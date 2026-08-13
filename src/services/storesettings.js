import api from './api';

export async function getCatalog() {
  const { data } = await api.get('/api/catalog');
  return data;
}

export async function getStoreSettings() {
  const { data } = await api.get('/api/settings');
  return data;
}

export async function updateStoreSettings(settings) {
  const { data } = await api.put('/api/settings', settings);
  return data;
}
