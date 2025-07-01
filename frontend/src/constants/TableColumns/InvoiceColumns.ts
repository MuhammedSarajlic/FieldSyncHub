import { TInvoice } from '../../types/Invoice';
import { TTableColumns } from '../../types/Table';
import { getInvoiceStatus } from '../../utils/FuntionHelpers/getInvoiceStatus';
import { InvoiceStatus } from '../Enumeration/InvoiceEnum/InvoiceEnum';

export const invoiceColumns: TTableColumns = [
  {
    header: 'Invoice #',
    accessor: 'invoiceNumber',
    type: 'text',
  },
  {
    header: 'Customer',
    accessor: (invoice: TInvoice) => invoice.customer?.fullName ?? '-',
    type: 'text',
    bold: true,
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
  },
];
