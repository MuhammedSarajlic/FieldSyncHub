import api from './api';

export type TimeEntry = {
  id: string;
  jobId: string;
  employeeId: string;
  clockIn: string;
  clockOut?: string;
  type: number;
  notes?: string;
};

export const getTimeEntries = (jobId: string) => api.get<TimeEntry[]>(`/job/${jobId}/time-entries`);
export const startTimeEntry = (jobId: string, type = 1) => api.post<TimeEntry>(`/job/${jobId}/time-entries`, { type, clockIn: new Date().toISOString() });
export const stopTimeEntry = (jobId: string, entryId: string) => api.patch<TimeEntry>(`/job/${jobId}/time-entries/${entryId}/clock-out`, new Date().toISOString());
export const completeJob = (jobId: string, completionNote: string, photoPaths: string[] = [], signaturePath?: string) => api.post(`/job/${jobId}/completion`, { completionNote, completionPhotoPaths: photoPaths, customerSignaturePath: signaturePath });
