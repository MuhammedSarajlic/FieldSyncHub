import { TAddWorkspace, TUpdateWorkspace } from '../types/Workspace';
import api from './api';

export async function GetWorkspaceById(workspaceId: string) {
  const response = await api.get(`/workspace/${workspaceId}`);
  return response;
}

export async function CreateWorkspace(workspace: TAddWorkspace) {
  const response = await api.post('/workspace', workspace);
  return response;
}

export async function UpdateWorkspace(workspace: TUpdateWorkspace) {
  const response = await api.put('/workspace', workspace);
  return response;
}
