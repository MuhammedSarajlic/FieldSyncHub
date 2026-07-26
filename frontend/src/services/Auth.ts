import api from './api';

export async function Register(user) {
  const response = await api.post('/auth/register', user);
  return response;
}

export async function Login(user) {
  const response = await api.post('/auth/login', user);
  return response;
}

export async function GoogleLogin(idToken: string) {
  const response = await api.post('/auth/google', { idToken });
  return response;
}

export async function Logout() {
  const response = await api.post('/auth/logout');
  return response;
}

export async function ForgotPassword(email: string) {
  const response = await api.post('/auth/forgot-password', { email });
  return response;
}

export async function ResetPassword(token: string, newPassword: string) {
  const response = await api.post('/auth/reset-password', {
    token,
    newPassword,
  });
  return response;
}
