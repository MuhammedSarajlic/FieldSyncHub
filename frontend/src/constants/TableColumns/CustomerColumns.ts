import { TCustomer } from '../../types/Customer';
import { TTableColumns } from '../../types/Table';

export const customerColumns: TTableColumns = [
  {
    header: 'Name',
    accessor: 'fullName',
    type: 'text',
    bold: true,
  },
  {
    header: 'Company',
    accessor: (customer: TCustomer) =>
      customer.isCompany ? customer.companyName : '-',
    type: 'text',
  },
  {
    header: 'Property',
    accessor: (customer: TCustomer) =>
      customer.properties.length === 1
        ? customer.properties?.[0]?.address
        : customer.properties.length === 0
        ? 'No properties'
        : `${customer.properties.length} properties`,
    type: 'text',
  },
  {
    header: 'Mobile',
    accessor: (customer: TCustomer) =>
      customer.customerPhones?.[0]?.phoneNumber ?? '-',
    type: 'text',
  },
  {
    header: 'Email',
    accessor: (customer: TCustomer) => customer.emails?.[0] ?? '-',
    type: 'text',
  },
  //   {
  //     header: 'Tags',
  //     accessor: 'tags',
  //     type: 'currency',
  //     align: 'right',
  //   },
];
