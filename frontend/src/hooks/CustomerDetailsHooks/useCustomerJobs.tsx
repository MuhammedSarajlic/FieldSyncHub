// src/hooks/useCustomerJobs.ts
import { useState, useEffect } from 'react';
import { TJob } from '../../types/Job';
import { GetJobsByCustomer } from '../../services/Job';

interface CustomerJobsResult {
  jobs: TJob[];
  loadingJobs: boolean;
  errorJobs: any;
  refetchJobs: () => Promise<void>;
}

export const useCustomerJobs = (
  customerId: string | undefined,
  shouldFetch: boolean // New prop to control fetching
): CustomerJobsResult => {
  const [jobs, setJobs] = useState<TJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [errorJobs, setErrorJobs] = useState<any>(null);

  const fetchJobs = async () => {
    if (!customerId || !shouldFetch) {
      // Only fetch if shouldFetch is true
      setJobs([]); // Clear previous data if not fetching
      return;
    }

    setLoadingJobs(true);
    setErrorJobs(null);
    try {
      const response = await GetJobsByCustomer(customerId);
      if (response.status === 200) {
        setJobs(response.data.payload);
      } else {
        setErrorJobs(response.data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setErrorJobs(err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    // This effect runs only when customerId or shouldFetch changes
    fetchJobs();
  }, [customerId, shouldFetch]);

  return { jobs, loadingJobs, errorJobs, refetchJobs: fetchJobs };
};
