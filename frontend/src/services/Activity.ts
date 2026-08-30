import api from './api';

export async function GetWorkspaceActivity(workspaceId: string, pageSize = 20) {
  return api.get(`/activity/workspace/${workspaceId}`, {
    params: { pageNumber: 1, pageSize },
  });
}
