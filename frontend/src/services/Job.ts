import { TAddJob, TRecordJobDepositPayment, TUpdateJob } from '../types/Job';
import api from './api';

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

export async function UpdateJob(job: TUpdateJob) {
  const response = await api.put('/job', job);
  return response;
}

export async function DeleteJob(jobId: string) {
  const response = await api.delete(`/job/${jobId}`);
  return response;
}

export async function RecordJobDepositPayment(
  jobId: string,
  payment: TRecordJobDepositPayment
) {
  const response = await api.post(`/job/${jobId}/deposit-payments`, payment);
  return response;
}
