import api from './api';

export async function loginUser(credentials) {
  const { data } = await api.post('/api/auth/login', credentials);
  return data;
}

export async function registerUser(user) {
  const { data } = await api.post('/api/auth/register', user);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get('/api/auth/me');
  return data.user;
}
