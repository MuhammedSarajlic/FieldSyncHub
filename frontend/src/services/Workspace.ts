import { TAddWorkspace } from '../types/Workspace';
import api from './api';

export async function CreateWorkspace(
  workspace: TAddWorkspace,
  createdById: string
) {
  const response = await api.post(`/workspace/${createdById}`, workspace);
  return response;
}
