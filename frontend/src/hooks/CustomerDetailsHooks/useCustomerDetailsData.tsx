// src/hooks/useCustomerDetailsData.ts
import { useState, useEffect } from 'react';
import { GetCustomerById } from '../services/Customer'; // Adjust path
import { TCustomer, TCustomerDetailsStats } from '../types/Customer'; // Adjust path
import { GetJobsByCustomer } from '../services/Job'; // For stats calculation
import { GetQuotesByCustomer } from '../services/Quote'; // For stats calculation
import { GetInvoicesByCustomer } from '../services/Invoice'; // For stats calculation

interface CustomerDetailsResult {
  customer: TCustomer | undefined;
  customerStats: TCustomerDetailsStats;
  loading: boolean;
  error: any; // Consider a more specific error type
  refetchCustomer: () => Promise<void>; // Function to re-fetch customer data
}

export const useCustomerDetailsData = (
  customerId: string | undefined
): CustomerDetailsResult => {
  const [customer, setCustomer] = useState<TCustomer | undefined>();
  const [customerStats, setCustomerStats] = useState<TCustomerDetailsStats>({
    totalJobs: 0,
    totalQuotes: 0,
    totalInvoiced: 0,
    invoicesCount: 0,
    lastActivity: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchCustomerAndStats = async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const customerResponse = await GetCustomerById(customerId);
      if (customerResponse.data.success) {
        setCustomer(customerResponse.data.payload);
      } else {
        setError(customerResponse.data.message ?? 'Failed to fetch customer');
      }

      // --- Backend Optimization Opportunity ---
      // This is where you'd ideally have a single backend endpoint
      // that returns customer details along with these aggregated stats.
      // If not, we have to make these calls here.
      // I'm keeping the individual calls for now to mirror your current logic,
      // but recommend a backend change.

      const [jobsRes, quotesRes, invoicesRes] = await Promise.all([
        GetJobsByCustomer(customerId),
        GetQuotesByCustomer(customerId),
        GetInvoicesByCustomer(customerId),
      ]);

      const newStats: TCustomerDetailsStats = {
        totalJobs: jobsRes.status === 200 ? jobsRes.data.payload.length : 0,
        totalQuotes:
          quotesRes.status === 200 ? quotesRes.data.payload.length : 0,
        invoicesCount:
          invoicesRes.status === 200 ? invoicesRes.data.payload.length : 0,
        totalInvoiced:
          invoicesRes.status === 200
            ? invoicesRes.data.payload.reduce((sum, i) => sum + i.total, 0)
            : 0,
        lastActivity: '', // This needs to be calculated from jobs/quotes/invoices.
        // Ideally, the backend would provide this.
        // For now, leaving as empty string or you can implement client-side logic.
      };

      setCustomerStats(newStats);
    } catch (err) {
      console.error('Failed to fetch customer details or stats:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerAndStats();
  }, [customerId]);

  return {
    customer,
    customerStats,
    loading,
    error,
    refetchCustomer: fetchCustomerAndStats,
  };
};
