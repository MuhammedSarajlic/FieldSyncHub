import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useEffect, useState } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import SortModal from '../../components/CustomElements/SortComponent/SortModal';
import FilterModal from '../../components/CustomElements/FilterComponent/FilterModal';
import Search from '../../components/CustomElements/Search';
import { useNavigate, useSearchParams } from 'react-router';
import { formatDate } from '../../utils/FuntionHelpers/formatDate';
import { invoiceFilterOptions } from '../../constants/Options/FilterOptions/InvoiceFilterOptions';
import { inoviceSortOptions } from '../../constants/Options/SortOptions/InvoiceSortOptions';
import CreateInvoiceModal from '../../components/Invoice/Modal/CreateInvoiceModal';
import { GetAllInvoicesByWorkspaceId } from '../../services/Invoice';
import { TInvoice } from '../../types/Invoice';
import { useAuth } from '../../context/AuthProvider';
import { getInvoiceStatus } from '../../utils/FuntionHelpers/getInvoiceStatus';

const Invoices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  const handleSearch = async (query: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (query) {
        newParams.set('q', query);
      } else {
        newParams.delete('q');
      }
      return newParams;
    });
  };

  const initialInvoiceFilters = {
    dueDate: { min: '', max: '' },
    total: { min: '', max: '' },
    status: '',
  };

  const [invoices, setInvoices] = useState<TInvoice[]>([]);

  const fetchAllInvoicesByWorkspace = async () => {
    if (!user) return;
    const response = await GetAllInvoicesByWorkspaceId(user?.workspace.id);
    if (response.status === 200) {
      setInvoices(response.data);
    }
    console.log(response);
  };

  // const invoices = [
  //   {
  //     id: 'INV-00123',
  //     customer: 'Sarah Johnson',
  //     email: 'sarah@example.com',
  //     date: '2024-06-18',
  //     dueDate: '2024-07-03',
  //     amount: 350.0,
  //     status: 'sent',
  //     jobId: 'JOB-4567',
  //     items: 3,
  //     paymentMethod: null,
  //     technician: 'Mike T.',
  //   },
  //   {
  //     id: 'INV-00124',
  //     customer: "Mike's Restaurant",
  //     email: 'mike@restaurant.com',
  //     date: '2024-06-20',
  //     dueDate: '2024-07-05',
  //     amount: 1250.0,
  //     status: 'paid',
  //     jobId: 'JOB-4568',
  //     items: 5,
  //     paymentMethod: 'stripe',
  //     technician: 'John D.',
  //   },
  //   {
  //     id: 'INV-00125',
  //     customer: 'Downtown Office LLC',
  //     email: 'admin@downtown.com',
  //     date: '2024-06-15',
  //     dueDate: '2024-06-30',
  //     amount: 875.5,
  //     status: 'overdue',
  //     jobId: 'JOB-4569',
  //     items: 4,
  //     paymentMethod: null,
  //     technician: 'Sarah M.',
  //   },
  //   {
  //     id: 'INV-00126',
  //     customer: 'Green Valley Apartments',
  //     email: 'manager@greenvalley.com',
  //     date: '2024-06-22',
  //     dueDate: '2024-07-07',
  //     amount: 2100.0,
  //     status: 'draft',
  //     jobId: 'JOB-4570',
  //     items: 8,
  //     paymentMethod: null,
  //     technician: 'Alex R.',
  //   },
  //   {
  //     id: 'INV-00127',
  //     customer: 'Tech Solutions Inc',
  //     email: 'billing@techsolutions.com',
  //     date: '2024-06-21',
  //     dueDate: '2024-07-06',
  //     amount: 650.0,
  //     status: 'sent',
  //     jobId: 'JOB-4571',
  //     items: 2,
  //     paymentMethod: null,
  //     technician: 'Mike T.',
  //   },
  // ];

  // Summary calculations
  const totalOutstanding = invoices
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalPaidThisMonth = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const overdueCount = invoices.filter(
    (inv) => inv.status === 'overdue'
  ).length;

  useEffect(() => {
    fetchAllInvoicesByWorkspace();
  }, []);

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <div>
          <Navbar />
        </div>

        <div className='px-4'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div>
              <p className='text-heading text-4xl font-extrabold'>Invoices</p>
              <p className='text-gray-600 mt-1'>
                Manage and track all your invoices
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <CustomIconButton
                icon={<Plus className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />}
                text='Create invoice'
                handleClick={() => setIsInvoiceModalOpen(true)}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6'>
            {/* Total Outstanding Card */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Total Outstanding
                </h3>

                <div className='text-3xl font-bold text-gray-900'>
                  ${totalOutstanding.toLocaleString()}
                </div>

                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                    <span className='text-sm font-medium text-orange-600'>
                      +15%
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>vs last month</span>
                </div>
              </div>
            </div>

            {/* Paid This Month Card */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Paid This Month
                </h3>

                <div className='text-3xl font-bold text-gray-900'>
                  ${totalPaidThisMonth.toLocaleString()}
                </div>

                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <span className='text-sm font-medium text-green-600'>
                      +23%
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>vs last month</span>
                </div>
              </div>
            </div>

            {/* Overdue Invoices Card */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Overdue Invoices
                </h3>

                <div className='text-3xl font-bold text-gray-900'>
                  {overdueCount}
                </div>

                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                    <span className='text-sm font-medium text-red-600'>
                      -8%
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>vs last week</span>
                </div>
              </div>
            </div>

            {/* Average Invoice Value Card */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Avg Invoice Value
                </h3>

                <div className='text-3xl font-bold text-gray-900'>
                  $
                  {(
                    invoices.reduce((sum, inv) => sum + inv.total, 0) /
                    invoices.length
                  ).toFixed(0)}
                </div>

                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <span className='text-sm font-medium text-blue-600'>
                      +12%
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>vs last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className='bg-white py-4 mb-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex-1 max-w-md'>
                <Search
                  inputPlaceholder='Search invoices...'
                  searchQuery={searchQuery}
                  handleChange={handleSearch}
                />
              </div>

              <div className='flex items-center gap-2'>
                <SortModal
                  setIsSortModalOpen={setIsSortModalOpen}
                  isSortModalOpen={isSortModalOpen}
                  sortOptions={inoviceSortOptions}
                />
                <FilterModal
                  initialFilters={initialInvoiceFilters}
                  filterOptions={invoiceFilterOptions}
                  setIsFilterModalOpen={setIsFilterModalOpen}
                  isFilterModalOpen={isFilterModalOpen}
                  // onApply={handleApplyFilters}
                />
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className='bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    {[
                      'Invoice #',
                      'Customer',
                      'Due Date',
                      'Status',
                      'Total',
                    ].map((header, index) => (
                      <th
                        key={index}
                        scope='col'
                        className={`px-6 py-3 ${
                          header === 'Total' ? 'text-right' : 'text-left'
                        } text-xs font-medium text-gray-500 uppercase tracking-wider`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.invoiceId}
                      onClick={() =>
                        navigate(`/invoices/${invoice.invoiceNumber}`)
                      }
                      className='hover:bg-gray-50 group h-[70px] cursor-pointer'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex flex-col'>
                            <div className='text-sm font-medium text-gray-900 flex items-center'>
                              {invoice.invoiceNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {invoice.customer.firstName}{' '}
                          {invoice.customer.lastName}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {formatDate(invoice.dueDate)}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            getInvoiceStatus(invoice.status).color
                          }`}
                        >
                          {getInvoiceStatus(invoice.status).icon}
                          <span className='ml-1 capitalize'>
                            {invoice.status}
                          </span>
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right'>
                        <div className='text-sm font-medium text-gray-900'>
                          $
                          {invoice.total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className='flex items-center justify-between mt-6'>
            <div className='text-sm text-gray-700'>
              Showing <span className='font-medium'>1</span> to{' '}
              <span className='font-medium'>{invoices.length}</span> of{' '}
              <span className='font-medium'>{invoices.length}</span> results
            </div>
            <div className='flex items-center space-x-2'>
              <button className='px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'>
                Previous
              </button>
              <button className='px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700'>
                1
              </button>
              <button className='px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'>
                2
              </button>
              <button className='px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      {isInvoiceModalOpen && (
        <CreateInvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          fetchAllInvoicesByWorkspace={fetchAllInvoicesByWorkspace}
        />
      )}
    </div>
  );
};

export default Invoices;
