import { TInvoice } from '../../types/Invoice';
import { TTableColumns } from '../../types/Table';
import { getInvoiceStatus } from '../../utils/FuntionHelpers/getInvoiceStatus';
import { InvoiceStatus } from '../Enumeration/InvoiceEnum/InvoiceEnum';

export const invoiceColumns: TTableColumns = [
  {
    header: 'Invoice #',
    accessor: 'invoiceNumber',
    type: 'text',
    sortKey: 'invoice-number',
  },
  {
    header: 'Customer',
    accessor: (invoice: TInvoice) => invoice.customer?.fullName ?? '-',
    type: 'text',
    bold: true,
    sortKey: 'customer',
  },
  {
    header: 'Issue date',
    accessor: 'issueDate',
    type: 'date',
    sortKey: 'due-date',
  },
  {
    header: 'Due date',
    accessor: 'dueDate',
    type: 'date',
  },
  {
    header: 'Status',
    accessor: 'status',
    type: 'status',
    statusConfig: (value: string | number) => getInvoiceStatus(Number(value)),
    enumMap: InvoiceStatus,
  },
  {
    header: 'Total',
    accessor: 'total',
    type: 'currency',
    align: 'right',
    bold: true,
    sortKey: 'total',
  },
];
