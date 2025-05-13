import { TAddWorkspace } from '../types/Workspace';
import api from './api';

export async function CreateWorkspace(workspace: TAddWorkspace) {
  const response = await api.post('/workspace', workspace);
  return response;
}
