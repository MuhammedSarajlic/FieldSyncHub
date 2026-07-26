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
