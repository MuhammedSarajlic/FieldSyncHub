import { TTableColumns } from '../../types/Table';
import { getQuoteStatus } from '../../utils/FuntionHelpers/getQuoteStatus';
import { QuoteStatus } from '../Enumeration/QuoteEnum/QuoteEnum';

export const quoteColumns: TTableColumns = [
  {
    header: 'Customer',
    accessor: (quote) => quote.customer.fullName ?? 'N/A',
    type: 'text',
    bold: true,
  },
  {
    header: 'Quote Number',
    accessor: 'quoteNumber',
    type: 'text',
  },
  {
    header: 'Property',
    accessor: (quote) =>
      quote.customer.properties?.[0]?.address ?? 'No property',
    type: 'text',
  },
  {
    header: 'Created',
    accessor: 'createdAt',
    type: 'date',
  },
  {
    header: 'Status',
    accessor: 'status',
    type: 'status',
    statusConfig: (value: string | number) => getQuoteStatus(Number(value)),
    enumMap: QuoteStatus,
  },
  {
    header: 'Total',
    accessor: 'total',
    type: 'currency',
    align: 'right',
  },
];
