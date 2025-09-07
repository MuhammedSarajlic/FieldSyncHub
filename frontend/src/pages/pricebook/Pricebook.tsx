import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import { Plus } from 'lucide-react';
import ButtonIcon from '../../components/CustomElements/ButtonIcon';
import icons from '../../constants/AssetsConstants/icons';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import Search from '../../components/CustomElements/Search';
import {
  ExportServiceItems,
  GetServiceItemsByFilter,
  GetServiceItemsByWorkspace,
  GetServiceItemsStats,
} from '../../services/ServiceItem';
import { TServiceItem, TServiceItemStats } from '../../types/ServiceItem';
import { useNavigate, useSearchParams } from 'react-router';
import SortModal from '../../components/CustomElements/SortComponent/SortModal';
import { pricebookSortOptions } from '../../constants/Options/SortOptions/PricebookSortOptions';
import FilterModal from '../../components/CustomElements/FilterComponent/FilterModal';
import { pricebookFilterOptions } from '../../constants/Options/FilterOptions/PricebookFilterOptions';
import Table from '../../components/Table/Table';
import { pricebookColumns } from '../../constants/TableColumns/PricebookColumns';
import { formatCurrency } from '../../utils/FuntionHelpers/formatCurrency';
import { useAuth } from '../../context/AuthProvider';
import { TPaginationData } from '../customers/Customers';
import { downloadCSVFile } from '../../utils/FuntionHelpers/downloadCSVFile';
import CreateServiceItemModal from '../../components/Pricebook/PricebookModals/CreateServiceItemModal';
import ServiceItemImportModal from '../../components/Pricebook/PricebookModals/ServiceItemImportModal';

const Pricebook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serviceItems, setServiceItems] = useState<TServiceItem[]>([]);
  const [isNewServiceItemModalOpen, setIsNewServiceItemModalOpen] =
    useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isImportServiceItemModalOpen, setIsImportServiceItemModalOpen] =
    useState(false);
  const [serviceItemStats, setServiceItemStats] = useState<TServiceItemStats>({
    totalItems: 0,
    totalMaterialItems: 0,
    totalServiceItems: 0,
    totalPricebookValue: 0,
    averageItemPrice: 0,

    totalItemsChange: '0%',
    materialItemsChange: '0%',
    serviceItemsChange: '0%',
    averageItemPriceChange: '0%',
  });
  const [searchParams] = useSearchParams();
  const [paginationData, setPaginationData] = useState<TPaginationData>({
    totalCount: 0,
    pageSize: 10,
  });

  const searchQuery = searchParams.get('q') ?? '';

  const initialPricebookFilters = {
    category: '',
    price: { min: '', max: '' },
    type: '',
    isActive: 'all',
    hasImage: 'all',
    description: '',
  };

  const fetchAllServiceItemsByWorkspace = async () => {
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

    const params = new URLSearchParams(paramsObj).toString();
    const hasAnyParam = Object.keys(paramsObj).length > 0;

    const response = hasAnyParam
      ? await GetServiceItemsByFilter(user.workspace.id, finalPage, 10, params)
      : await GetServiceItemsByWorkspace(user.workspace.id, finalPage, 10);

    if (response.status === 200) {
      const { items, totalCount, pageSize } = response.data.payload;

      setServiceItems(items);
      setPaginationData({ totalCount, pageSize });

      if (shouldResetPage && currentPage > 1) {
        const newParams = new URLSearchParams(paramsObj);
        navigate(`?${newParams.toString()}`);
      }
    }
  };

  const handleExportPricebook = async () => {
    if (!user?.workspace) return;
    try {
      const response = await ExportServiceItems(user.workspace.id);
      if (response.status !== 200) {
        console.log('Error exporting service items');
        return;
      }
      downloadCSVFile(
        response.data,
        `service_items_workspace_${user.workspace.id}.csv`
      );
    } catch (error) {
      console.error('Failed to export service items:', error);
    }
  };

  const fetchPricebookStats = async () => {
    if (!user?.workspace) return;
    const response = await GetServiceItemsStats(user.workspace.id);
    if (response.status === 200) {
      setServiceItemStats(response.data.payload);
    }
  };

  useEffect(() => {
    fetchPricebookStats();
  }, []);

  useEffect(() => {
    fetchAllServiceItemsByWorkspace();
  }, [searchParams]);

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 ml-64'>
        <Navbar />

        <div className='px-6 pt-6 flex flex-col flex-1'>
          <div className='pb-4 mb-4 flex justify-between items-start'>
            <div>
              <p className='text-heading text-4xl font-extrabold'>Pricebook</p>
              <p className='text-gray-600 mt-1'>
                Manage your services, materials, and pricing
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              <ButtonIcon
                handleBtnClick={() => setIsImportServiceItemModalOpen(true)}
                name='Import'
                icon={icons.importIcon}
              />

              <ButtonIcon
                handleBtnClick={handleExportPricebook}
                name='Export'
                icon={icons.exportIcon}
              />
              <div className='w-[1px] h-[38px] bg-border-primary'></div>
              <CustomIconButton
                text={'Add Item'}
                icon={<Plus size={16} className='mr-1.5' />}
                handleClick={() => setIsNewServiceItemModalOpen(true)}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6'>
            {/* Total Items Card */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Total Pricebook Items
                </h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {serviceItemStats.totalItems}
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                    <span className='text-sm font-medium text-purple-600'>
                      {serviceItemStats?.totalItemsChange}
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>vs last month</span>
                </div>
              </div>
            </div>

            {/* Total Material Items Card */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Material Items
                </h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {serviceItemStats.totalMaterialItems}
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <span className='text-sm font-medium text-green-600'>
                      {serviceItemStats?.materialItemsChange}
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>vs last month</span>
                </div>
              </div>
            </div>

            {/* Total Service Items Card */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Service Items
                </h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {serviceItemStats.totalServiceItems}
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <span className='text-sm font-medium text-blue-600'>
                      {serviceItemStats?.serviceItemsChange}
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>vs last month</span>
                </div>
              </div>
            </div>

            {/* Average Item Price Card */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Avg. Item Price
                </h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {formatCurrency(serviceItemStats.averageItemPrice)}
                </div>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                    <span className='text-sm font-medium text-orange-600'>
                      {serviceItemStats?.averageItemPriceChange}
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
                  sortOptions={pricebookSortOptions}
                />
                <FilterModal
                  initialFilters={initialPricebookFilters}
                  filterOptions={pricebookFilterOptions}
                  setIsFilterModalOpen={setIsFilterModalOpen}
                  isFilterModalOpen={isFilterModalOpen}
                />
              </div>
            </div>
          </div>

          <Table<TServiceItem>
            data={serviceItems}
            columns={pricebookColumns}
            paginationData={paginationData}
          />
        </div>
      </div>
      {isNewServiceItemModalOpen && (
        // <PricebookItemModal onClose={() => setIsNewServiceModalOpen(false)} />
        <CreateServiceItemModal
          isOpen={isNewServiceItemModalOpen}
          onClose={() => setIsNewServiceItemModalOpen(false)}
          workspaceId={user?.workspace?.id}
        />
      )}
      {isImportServiceItemModalOpen && (
        <ServiceItemImportModal
          isOpen={isImportServiceItemModalOpen}
          onClose={() => setIsImportServiceItemModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Pricebook;
