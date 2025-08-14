import { TUserLogin } from '../types/User';
import api from './api';

export async function SendInvite(email: string, workspaceId: string) {
  const response = await api.post(
    `/invite/send-invite?email=${email}&workspaceId=${workspaceId}`
  );
  return response;
}

export async function SendInviteBulk(emails: string[], workspaceId: string) {
  const response = await api.post(`/invite/send-invite/bulk`, {
    emails,
    workspaceId,
  });
  return response;
}

export async function ValidateInviteToken(token: string) {
  const response = await api.get(`/invite/validate-token?token=${token}`);
  return response;
}

export async function AcceptInvite(token: string, user: TUserLogin) {
  const response = await api.post(`/invite/accept-invite?token=${token}`, user);
  return response;
}
