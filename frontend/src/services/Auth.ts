import api from './api';

export async function Register(user) {
  const response = await api.post('/auth/register', user);
  return response;
}

export async function Login(user) {
  const response = await api.post('/auth/login', user);
  return response;
}
