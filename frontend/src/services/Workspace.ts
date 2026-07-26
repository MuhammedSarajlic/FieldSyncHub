import { TAddWorkspace, TUpdateWorkspace } from '../types/Workspace';
import api from './api';

export async function CreateWorkspace(
  workspace: TAddWorkspace,
  createdById: string
) {
  const response = await api.post(`/workspace/${createdById}`, workspace);
  return response;
}

export async function UpdateWorkspace(workspace: TUpdateWorkspace) {
  const response = await api.put('/workspace', workspace);
  return response;
}
