import { ParsedCustomerRow } from '../../components/Customers/ImportCustomer/ImportCustomersModal';
import { TImportCustomer } from '../../types/Customer';

export const transformToImportCustomers = (
  rows: ParsedCustomerRow[]
): TImportCustomer[] => {
  return rows
    .filter((row) => !row.hasErrors)
    .map((r) => {
      const data = r.data;
      return {
        firstName: data['first name'],
        lastName: data['last name'],
        companyName: data['company name'] || null,
        isCompany: data['is company']?.toLowerCase() === 'true',
        email: data['email'] ? [data['email']] : [],
        tags: data['tags'] ? data['tags'].split(',').map((t) => t.trim()) : [],
        visitReminders: data['visit reminders']?.toLowerCase() === 'true',
        jobFollowUps: data['job follow ups']?.toLowerCase() === 'true',
        quoteFollowUps: data['quote follow ups']?.toLowerCase() === 'true',
        invoiceFollowUps: data['invoice follow ups']?.toLowerCase() === 'true',
        archived: data['archived']?.toLowerCase() === 'true',
        createdAt: data['created at']
          ? new Date(data['created at'])
          : undefined,
      };
    });
};
