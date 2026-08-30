import { TUpdateUser } from '../types/User';
import api from './api';

export async function GetLoggedInUser(token: string) {
  const response = await api.get('/user/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

export async function UpdateUser(user: TUpdateUser) {
  const response = await api.put('/user', user);
  return response;
}

export async function DeleteUser(userId: string) {
  const response = await api.delete(`/user/${userId}`);
  return response;
}

export async function ConfirmEmailChange(token: string) {
  const response = await api.post(
    `/user/confirm-email-change?token=${token}`
  );
  return response;
}
