import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import { Plus } from 'lucide-react';
import IconButton from '../components/CustomElements/Buttons/IconButton';
import Search from '../components/CustomElements/Search';
import SortModal from '../components/CustomElements/SortComponent/SortModal';
import FilterModal from '../components/CustomElements/FilterComponent/FilterModal';
import Table from '../components/Table/Table';
import { TLead } from '../types/Lead';
import { TPaginationData } from '../types/Table';
import { leadColumns } from '../constants/TableColumns/LeadColumns';
import { leadSortOptions } from '../constants/Options/SortOptions/LeadSortOptions';
import { leadFilterOptions } from '../constants/Options/FilterOptions/LeadFilterOptions';
import { GetLeadsByWorkspaceId } from '../services/Lead';
import AddLeadModal from '../components/Lead/Modals/AddLeadModal';
import { useAuth } from '../context/AuthProvider';
import { useSearchParams } from 'react-router';
import { LeadPriority, LeadStatus } from '../constants/Enumeration/LeadEnum/LeadEnum';

const PAGE_SIZE = 10;

const Leads = () => {
  const { user } = useAuth();
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [leads, setLeads] = useState<TLead[]>([]);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') ?? '';
  const sortBy = searchParams.get('sortBy') ?? '';
  const sort = searchParams.get('sort') ?? '';
  const statusFilter = searchParams.get('status') ?? 'all';
  const priorityFilter = searchParams.get('priority') ?? 'all';
  const createdDateMin = searchParams.get('createdDateMin') ?? '';
  const createdDateMax = searchParams.get('createdDateMax') ?? '';
  const currentPage = parseInt(searchParams.get('page') ?? '1', 10);

  const initialLeadFilters = {
    status: 'all',
    priority: 'all',
    createdDate: { min: '', max: '' },
  };

  const fetchLeads = async () => {
    if (!user?.workspace) return;
    const response = await GetLeadsByWorkspaceId(user.workspace.id);
    if (response.status === 200) {
      setLeads(response.data.payload);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user?.workspace?.id]);

  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (lead) =>
          lead.customer?.fullName?.toLowerCase().includes(q) ||
          lead.description?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      const statusKey = (statusFilter.charAt(0).toUpperCase() +
        statusFilter.slice(1)) as keyof typeof LeadStatus;
      const statusValue = LeadStatus[statusKey];
      if (statusValue !== undefined) {
        result = result.filter((lead) => lead.status === statusValue);
      }
    }

    if (priorityFilter !== 'all') {
      const priorityKey = (priorityFilter.charAt(0).toUpperCase() +
        priorityFilter.slice(1)) as keyof typeof LeadPriority;
      const priorityValue = LeadPriority[priorityKey];
      if (priorityValue !== undefined) {
        result = result.filter((lead) => lead.priority === priorityValue);
      }
    }

    if (createdDateMin) {
      result = result.filter(
        (lead) => new Date(lead.createdAt) >= new Date(createdDateMin)
      );
    }
    if (createdDateMax) {
      result = result.filter(
        (lead) => new Date(lead.createdAt) <= new Date(createdDateMax)
      );
    }

    if (sortBy && sort) {
      result.sort((a, b) => {
        let diff = 0;
        if (sortBy === 'createdAt') {
          diff =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === 'customer') {
          diff = (a.customer?.fullName ?? '').localeCompare(
            b.customer?.fullName ?? ''
          );
        } else if (sortBy === 'priority') {
          diff = a.priority - b.priority;
        }
        return sort === 'asc' ? diff : -diff;
      });
    }

    return result;
  }, [
    leads,
    searchQuery,
    statusFilter,
    priorityFilter,
    createdDateMin,
    createdDateMax,
    sortBy,
    sort,
  ]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLeads.slice(start, start + PAGE_SIZE);
  }, [filteredLeads, currentPage]);

  const paginationData: TPaginationData = {
    totalCount: filteredLeads.length,
    pageSize: PAGE_SIZE,
  };

  const stats = useMemo(() => {
    const now = new Date();
    const newThisMonth = leads.filter((lead) => {
      const created = new Date(lead.createdAt);
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;

    const companies = leads.filter((lead) => lead.customer?.isCompany).length;
    const individuals = leads.length - companies;

    const missingInfo = leads.filter((lead) => {
      const customer = lead.customer;
      if (!customer) return true;
      const hasEmail = customer.emails?.length > 0;
      const hasPhone = customer.customerPhones?.length > 0;
      return !hasEmail && !hasPhone;
    }).length;

    return {
      total: leads.length,
      newThisMonth,
      companies,
      individuals,
      missingInfo,
    };
  }, [leads]);

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 md:ml-64'>
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
                variant='primary'
                icon={<Plus className='w-4 h-4 mr-1' />}
              >
                Add Lead
              </IconButton>
            </div>
          </div>

          {/* Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8'>
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Total Leads
                </h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {stats.total}
                </div>
                <div className='text-sm text-gray-500'>All-time</div>
              </div>
            </div>

            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  New This Month
                </h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {stats.newThisMonth}
                </div>
                <div className='text-sm text-gray-500'>
                  Compared to last month
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Companies vs Individuals
                </h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {stats.companies} / {stats.individuals}
                </div>
                <div className='text-sm text-gray-500'>
                  Companies / Individuals
                </div>
              </div>
            </div>

            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Missing Info
                </h3>
                <div className='text-3xl font-bold text-gray-900'>
                  {stats.missingInfo}
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
                inputPlaceholder='Search leads...'
                searchQuery={searchQuery}
              />
            </div>
            <div className='flex items-center gap-2'>
              <SortModal
                setIsSortModalOpen={setIsSortModalOpen}
                isSortModalOpen={isSortModalOpen}
                sortOptions={leadSortOptions}
              />
              <FilterModal
                initialFilters={initialLeadFilters}
                filterOptions={leadFilterOptions}
                setIsFilterModalOpen={setIsFilterModalOpen}
                isFilterModalOpen={isFilterModalOpen}
              />
            </div>
          </div>

          {/* Table */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            <Table<TLead>
              data={paginatedLeads}
              columns={leadColumns}
              paginationData={paginationData}
            />
          </div>
        </div>
      </div>
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onCreated={fetchLeads}
      />
    </div>
  );
};

export default Leads;
