import { TAddCustomField } from '../types/CustomField';
import api from './api';

export async function GetCustomFieldsByWorkspace(workspaceId: string) {
  const response = await api.get(`/customfield/workspace/${workspaceId}`);
  return response;
}

export async function CreateCustomField(customField: TAddCustomField) {
  const response = await api.post(`/customfield`, customField);
  return response;
}
