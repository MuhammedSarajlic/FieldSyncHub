import { TAddJob } from '../types/Job';
import api from './api';

export async function GetJobs() {
  const response = await api.get('/job');
  return response;
}

export async function GetJobById(jobId: string) {
  const response = await api.get(`/job/${jobId}`);
  return response;
}

export async function GetJobStats(wokrspaceId: string) {
  const response = await api.get(`/job/workspace/${wokrspaceId}/job-stats`);
  return response;
}

export async function GetJobsByWorkspaceId(
  wokrspaceId: string,
  pageNumber: number,
  pageSize: number
) {
  const response = await api.get(
    `/job/workspace/${wokrspaceId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return response;
}

export async function GetJobsByCustomer(customerId: string) {
  const response = await api.get(`/job/customer/${customerId}`);
  return response;
}

export async function GetJobsByFilter(
  workspaceId: string,
  pageNumber: number,
  pageSize: number,
  params: string
) {
  const response = await api.get(
    `/job/workspace/${workspaceId}/filter?${params}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return response;
}

export async function CreateJob(job: TAddJob) {
  const response = await api.post('/job', job);
  return response;
}
