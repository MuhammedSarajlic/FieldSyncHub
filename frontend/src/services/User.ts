import api from './api';

export async function GetLoggedInUser(token: string) {
  const response = await api.get('/user/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}
