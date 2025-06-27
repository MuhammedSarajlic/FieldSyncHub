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
import Table from '../../components/Table/Table';
import { invoiceColumns } from '../../constants/Columns/InvoiceColumns';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';

const Invoices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [paginationData, setPaginationData] = useState<TPaginationData>({
    totalCount: 0,
    pageSize: 10,
  });
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

        <div className='px-6 pt-6'>
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
                  {formatCurrency(
                    invoices.reduce((sum, inv) => sum + inv.total, 0) /
                      invoices.length
                  )}
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
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            <Table<TInvoice>
              data={invoices}
              columns={invoiceColumns}
              paginationData={paginationData}
            />
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
