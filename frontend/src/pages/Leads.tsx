import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import { Plus } from 'lucide-react';
import IconButton from '../components/CustomElements/Buttons/IconButton';
import Table from '../components/Table/Table';
import { TLead } from '../types/Lead';
import { TPaginationData } from './customers/Customers';
import { leadColumns } from '../constants/TableColumns/LeadColumns';
import { GetAllLeads } from '../services/Lead';
import AddLeadModal from '../components/Lead/Modals/AddLeadModal';

const Leads = () => {
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState<boolean>(false);

  const [leads, setLeads] = useState([]);
  const [paginationData, setPaginationData] = useState<TPaginationData>({
    totalCount: 0,
    pageSize: 10,
  });

  const fetchLeads = async () => {
    const response = await GetAllLeads();
    if (response.status === 200) {
      setLeads(response.data.payload);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 ml-64'>
        <Navbar />
        <div className='px-6 pt-6 mb-10'>
          {/* Header */}
          <div className='pb-4 mb-4 flex items-center justify-between'>
            <div>
              <p className='text-heading text-4xl font-extrabold'>Leads</p>
              <p className='text-gray-600 mt-1'>
                Manage and track all your leads
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              <IconButton
                onClick={() => setIsAddLeadModalOpen(true)}
                customStyle='py-2 px-4 bg-bg-primary text-white hover:bg-bg-primary-hover'
                icon={<Plus className='w-4 h-4 mr-1' />}
              >
                Add Lead
              </IconButton>
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
                <div className='text-3xl font-bold text-gray-900'>1</div>
                <div className='text-sm text-gray-500'>All-time</div>
              </div>
            </div>

            {/* New This Month */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  New This Month
                </h3>
                <div className='text-3xl font-bold text-gray-900'>2</div>
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
                <div className='text-3xl font-bold text-gray-900'>3</div>
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
                <div className='text-3xl font-bold text-gray-900'>4</div>
                <div className='text-sm text-gray-500'>
                  No email or phone number
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {/* <div className='flex items-center justify-between gap-4 mb-8'>
                <div className='flex-1 max-w-md'>
                  <Search
                    inputPlaceholder='Search customers...'
                    searchQuery={searchQuery}
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
              </div> */}

          {/* Table */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            <Table<TLead>
              data={leads}
              columns={leadColumns}
              paginationData={paginationData}
            />
          </div>
        </div>
      </div>
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
      />
    </div>
  );
};

export default Leads;
