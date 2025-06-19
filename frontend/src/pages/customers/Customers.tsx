import { useEffect, useState } from 'react';
import ButtonIcon from '../../components/CustomElements/ButtonIcon';
import Search from '../../components/CustomElements/Search';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import icons from '../../constants/icons';
import CreateCustomerModal from '../../components/Customers/CreateCustomerModal/CreateCustomerModal';
import { TCustomer, TCustomerStats } from '../../types/Customer';
import ImportCustomersModal from '../../components/Customers/ImportCustomer/ImportCustomersModal';
import {
  ExportCustomers,
  GetCustomerByWorkspace,
  GetCustomersByFilter,
  GetCustomerStats,
} from '../../services/Customer';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import { useNavigate, useSearchParams } from 'react-router';
import SortModal from '../../components/CustomElements/SortComponent/SortModal';
import FilterModal from '../../components/CustomElements/FilterComponent/FilterModal';
import Table from '../../components/Table/Table';
import { customerColumns } from '../../constants/Columns/CustomerColumns';
import { customerSortOptions } from '../../constants/Options/SortOptions/CustomerSortOptions';
import { customerFilterOptions } from '../../constants/Options/FilterOptions/CustomerFilterOptions';
import { downloadCSVFile } from '../../utils/FuntionHelpers/downloadCSVFile';

export type TPaginationData = {
  totalCount: number;
  pageSize: number;
};

const Customers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] =
    useState<boolean>(false);
  const [isImportCustomerModalOpen, setIsImportCustomerModalOpen] =
    useState<boolean>(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  const [customerStats, setCustomerStats] = useState<TCustomerStats>();
  const [paginationData, setPaginationData] = useState<TPaginationData>({
    totalCount: 0,
    pageSize: 10,
  });
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  const initialCustomerFilters = {
    createdDate: { min: '', max: '' },
    properties: { min: '', max: '' },
    customerType: 'all',
    hasEmail: 'all',
    hasPhone: 'all',
    tags: '',
  };

  const fetchAllCustomersByWorkspace = async () => {
    if (!user?.workspace) return;

    const paramsObj: Record<string, string> = {};
    let shouldResetPage = false;

    searchParams.forEach((value, key) => {
      if (key === 'page') return;
      paramsObj[key] = value;
      shouldResetPage = true;
    });

    const currentPage = searchParams.get('page')
      ? parseInt(searchParams.get('page')!)
      : 1;
    const finalPage = shouldResetPage ? 1 : currentPage;

    const queryString = new URLSearchParams(paramsObj).toString();
    const hasAnyParam = Object.keys(paramsObj).length > 0;

    const response = hasAnyParam
      ? await GetCustomersByFilter(
          user.workspace.id,
          finalPage,
          10,
          queryString
        )
      : await GetCustomerByWorkspace(user.workspace.id, finalPage, 10);

    if (response.status === 200) {
      const { items, totalCount, pageSize } = response.data.payload;
      setCustomers(items);
      setPaginationData({ totalCount, pageSize });

      if (shouldResetPage && currentPage > 1) {
        const newParams = new URLSearchParams(paramsObj);
        navigate(`?${newParams.toString()}`);
      }
    }
  };

  const fetchCustomerStats = async () => {
    if (!user?.workspace) return;
    const response = await GetCustomerStats(user.workspace.id);
    if (response.status === 200) {
      setCustomerStats(response.data);
    }
  };

  const handleExportCustomers = async () => {
    if (!user?.workspace) return;
    try {
      const response = await ExportCustomers(user.workspace.id as string);
      if (response.status !== 200) {
        console.log('Error exporting customers');
        return;
      }
      downloadCSVFile(
        response.data,
        `customers_workspace_${user.workspace.id}.csv`
      );
    } catch (error) {
      console.error('Failed to export customers:', error);
    }
  };

  useEffect(() => {
    fetchCustomerStats();
  }, []);

  useEffect(() => {
    fetchAllCustomersByWorkspace();
  }, [searchParams]);

  useEffect(() => {
    if (isAddCustomerModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isAddCustomerModalOpen]);

  return (
    <>
      <div className='flex mb-4'>
        <Sidebar />
        <div className='flex-1 ml-[260px]'>
          <div>
            <Navbar />
          </div>
          <div className='px-6 mb-10'>
            {/* Header */}
            <div className='pb-4 mb-4 flex items-center justify-between'>
              <div>
                <p className='text-heading text-4xl font-extrabold'>
                  Customers
                </p>
                <p className='text-gray-600 mt-1'>
                  Manage and track all your customers
                </p>
              </div>
              <div className='flex items-center space-x-3'>
                <ButtonIcon
                  name='Import'
                  icon={icons.importIcon}
                  handleBtnClick={() => setIsImportCustomerModalOpen(true)}
                />

                <ButtonIcon
                  name='Export'
                  icon={icons.exportIcon}
                  handleBtnClick={handleExportCustomers}
                />
                <div className='w-[1px] h-[38px] bg-border-primary'></div>
                <CustomIconButton
                  icon={<Plus className='w-4 h-4 mr-1' />}
                  text='Add customer'
                  handleClick={() => setIsAddCustomerModalOpen(true)}
                />
              </div>
            </div>

            {/* Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8'>
              {/* Total Customers */}
              <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-gray-600'>
                    Total Customers
                  </h3>
                  <div className='text-3xl font-bold text-gray-900'>
                    {customerStats?.total}
                  </div>
                  <div className='text-sm text-gray-500'>All-time</div>
                </div>
              </div>

              {/* New This Month */}
              <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-gray-600'>
                    New This Month
                  </h3>
                  <div className='text-3xl font-bold text-gray-900'>
                    {customerStats?.newCustomers}
                  </div>
                  <div className='text-sm text-gray-500'>
                    Compared to last month
                  </div>
                </div>
              </div>

              {/* Companies vs Individuals */}
              <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-gray-600'>
                    Companies vs Individuals
                  </h3>
                  <div className='text-3xl font-bold text-gray-900'>
                    {customerStats?.companies} / {customerStats?.individuals}
                  </div>
                  <div className='text-sm text-gray-500'>
                    Companies / Individuals
                  </div>
                </div>
              </div>

              {/* Incomplete Profiles */}
              <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
                <div className='space-y-3'>
                  <h3 className='text-sm font-medium text-gray-600'>
                    Missing Info
                  </h3>
                  <div className='text-3xl font-bold text-gray-900'>
                    {customerStats?.missingInfoCustomers}
                  </div>
                  <div className='text-sm text-gray-500'>
                    No email or phone number
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className='flex items-center justify-between gap-4 mb-8'>
              <div className='flex-1 max-w-md'>
                <Search
                  inputPlaceholder='Search quotes...'
                  searchQuery={searchQuery}
                  // handleChange={handleSearch}
                />
              </div>
              <div className='flex items-center gap-2'>
                <SortModal
                  setIsSortModalOpen={setIsSortModalOpen}
                  isSortModalOpen={isSortModalOpen}
                  sortOptions={customerSortOptions}
                />
                <FilterModal
                  initialFilters={initialCustomerFilters}
                  filterOptions={customerFilterOptions}
                  setIsFilterModalOpen={setIsFilterModalOpen}
                  isFilterModalOpen={isFilterModalOpen}
                />
              </div>
            </div>

            {/* Table */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
              <Table<TCustomer>
                data={customers}
                columns={customerColumns}
                paginationData={paginationData}
              />
            </div>
          </div>
        </div>
      </div>
      {isAddCustomerModalOpen && (
        <CreateCustomerModal
          setIsAddCustomerModalOpen={setIsAddCustomerModalOpen}
          getAllCustomersByWorkspace={fetchAllCustomersByWorkspace}
          getCustomersStats={fetchCustomerStats}
        />
      )}
      {isImportCustomerModalOpen && (
        <ImportCustomersModal
          setIsImportCustomerModalOpen={setIsImportCustomerModalOpen}
        />
      )}
    </>
  );
};

export default Customers;
