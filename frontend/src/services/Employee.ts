import { TUpdateEmployee } from '../types/Employee';
import api from './api';

export async function GetEmployeesByWorkspace(workspaceId: string) {
  const response = await api.get(`/employee/workspace/${workspaceId}`);
  return response;
}

export async function GetEmployeeById(employeeId: string) {
  const response = await api.get(`/employee/${employeeId}`);
  return response;
}

export async function GetEmployeeStats(workspaceId: string) {
  const response = await api.get(`/employee/${workspaceId}/stats`);
  return response;
}

export async function GetEmployeesByFilter(
  workspaceId: string,
  params: string
) {
  const response = await api.get(
    `/employee/workspace/${workspaceId}/filter?${params}`
  );
  return response;
}

export async function UpdateEmployee(employee: TUpdateEmployee) {
  const response = await api.put(`/employee`, employee);
  return response;
}

export async function ExportEmployees(workspaceId: string) {
  const response = await api.get(`/employee/export/${workspaceId}`);
  return response;
}
