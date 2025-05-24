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

export async function CreateJob(job: TAddJob) {
  const response = await api.post('/job', job);
  return response;
}
