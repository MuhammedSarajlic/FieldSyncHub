import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UserPlus, Grid, List } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import InviteEmployeeModal from '../../components/Employee/EmployeeModals/InviteEmployeeModal';
import { useAuth } from '../../context/AuthProvider';
import { GetEmployeesByWorkspace } from '../../services/Employee';
import { TEmployee } from '../../types/Employee';
import EmployeeDetailsView from '../../components/Employee/EmployeeModals/EmployeeDetailsView';
import EmployeeCard from '../../components/Employee/EmployeeCard';
import EmployeeTable from '../../components/Employee/EmployeeTable/EmployeeTable';
import EmptyEmployeeTable from '../../components/Employee/EmployeeTable/EmptyEmployeeTable';
import { useSearchParams } from 'react-router';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import ButtonIcon from '../../components/CustomElements/ButtonIcon';
import icons from '../../constants/icons';
import Search from '../../components/CustomElements/Search';
import SortModal from '../../components/CustomElements/SortComponent/SortModal';
import FilterModal from '../../components/CustomElements/FilterComponent/FilterModal';
import { employeeFilterOptions } from '../../constants/Options/EmployeeFilterOptions';

const Employees = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const sortOptions = [
    { id: 'name-asc', label: 'Name (A-Z)', sortBy: 'name', sort: 'asc' },
    { id: 'name-desc', label: 'Name (Z-A)', sortBy: 'name', sort: 'desc' },
  ];
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    location: 'all',
    position: 'all',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [employees, setEmployees] = useState<TEmployee[]>([]);

  const getStatusBadge = (
    status: string
  ): { background: string; indicator: string } => {
    switch (status) {
      case 'active':
        return {
          background: 'bg-green-100 text-green-800',
          indicator: 'bg-green-500',
        };
      case 'on-leave':
        return {
          background: 'bg-yellow-100 text-yellow-800',
          indicator: 'bg-yellow-500',
        };
      case 'terminated':
        return {
          background: 'bg-red-100 text-red-800',
          indicator: 'bg-red-500',
        };
      default:
        return {
          background: 'bg-gray-100 text-gray-800',
          indicator: 'bg-gray-500',
        };
    }
  };

  const [currentSort, setCurrentSort] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  const handleSort = (optionId: string) => {
    setCurrentSort(optionId);
    const selectedOption = sortOptions.find((opt) => opt.id === optionId);
    if (selectedOption) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('sortBy', selectedOption.sortBy);
        newParams.set('sort', selectedOption.sort);
        return newParams;
      });
    } else {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('sortBy');
        newParams.delete('sort');
        return newParams;
      });
    }
    setIsSortModalOpen(false);
  };

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

  const handleViewProfile = (employee) => {
    setActiveEmployee(employee);
    setShowQuickView(true);
  };

  const resetFilters = () => {
    setFilters({
      department: 'all',
      status: 'all',
      location: 'all',
      position: 'all',
    });
    setSearchTerm('');
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const getEmployeesByWorkspaceId = async () => {
    try {
      const response = await GetEmployeesByWorkspace(
        user?.workspace.id as string
      );
      if (response.status === 200) {
        setEmployees(response.data.payload);
        setEmployees(response.data.payload);
      }
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getEmployeesByWorkspaceId();
  }, []);

  const activeFiltersCount = Object.values(filters).filter(
    (val) => val !== 'all'
  ).length;

  return (
    <div className='flex h-screen overflow-hidden '>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden ml-[260px]'>
        <Navbar />

        <div className='flex-1 overflow-y-auto px-4'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div>
              <p className='text-heading text-4xl font-extrabold'>Employees</p>
              <p className='text-gray-600 mt-1'>Manage your team members</p>
            </div>
            <div className='flex items-center gap-3'>
              <ButtonIcon name='Export' icon={icons.exportIcon} />
              <CustomIconButton
                icon={<UserPlus className='h-4 w-4 mr-2' />}
                text='Invite Employee'
                handleClick={() => setIsInviteModalOpen(true)}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4'>
            {/* Total Employees Card */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Total Employees
                </h3>

                <div className='text-3xl font-bold text-gray-900'>
                  {employees.length}
                </div>

                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <span className='text-sm font-medium text-green-600'>
                      +90%
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>25 last week</span>
                </div>
              </div>
            </div>

            {/* Active Employees Card */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>Active</h3>

                <div className='text-3xl font-bold text-gray-900'>
                  {employees.filter((e) => e.status === 'active').length}
                </div>

                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <span className='text-sm font-medium text-green-600'>
                      +90%
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>25 last week</span>
                </div>
              </div>
            </div>

            {/* On Leave Card */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>On Leave</h3>

                <div className='text-3xl font-bold text-gray-900'>
                  {employees.filter((e) => e.status === 'on-leave').length}
                </div>

                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-amber-500 rounded-full'></div>
                    <span className='text-sm font-medium text-amber-600'>
                      0%
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>0 last week</span>
                </div>
              </div>
            </div>

            {/* Fourth Card - You can add another metric here */}
            <div className='bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Departments
                </h3>

                <div className='text-3xl font-bold text-gray-900'>
                  {[...new Set(employees.map((e) => e.department))].length || 0}
                </div>

                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <span className='text-sm font-medium text-blue-600'>
                      +5%
                    </span>
                  </div>
                  <span className='text-sm text-gray-500'>1 last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className='bg-white py-4 mb-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex-1 max-w-md'>
                <Search
                  inputPlaceholder='Search employees...'
                  searchQuery={searchQuery}
                  handleChange={handleSearch}
                />
              </div>

              <div className='flex items-center gap-2'>
                <SortModal
                  setIsSortModalOpen={setIsSortModalOpen}
                  isSortModalOpen={isSortModalOpen}
                  sortOptions={sortOptions}
                  currentSort={currentSort}
                  handleSort={handleSort}
                />
                <FilterModal
                  filterOptions={employeeFilterOptions}
                  activeFiltersCount={activeFiltersCount}
                  setIsFilterModalOpen={setShowFilterModal}
                  isFilterModalOpen={showFilterModal}
                />
                {/* <button
                  onClick={() => setShowFilterModal(true)}
                  className='relative inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
                >
                  <Filter className='h-4 w-4 mr-2' />
                  Filter
                  {activeFiltersCount > 0 && (
                    <span className='absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center'>
                      {activeFiltersCount}
                    </span>
                  )}
                </button> */}

                <div className='flex items-center bg-gray-100 rounded-lg p-1'>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    <Grid className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    <List className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Employee List */}
          {isLoading ? (
            <div className='flex justify-center items-center h-64'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
            </div>
          ) : employees.length > 0 ? (
            <div>
              {viewMode === 'grid' ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                  {employees.map((employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      handleViewProfile={handleViewProfile}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              ) : (
                <EmployeeTable
                  employees={employees}
                  getStatusBadge={getStatusBadge}
                  handleViewProfile={handleViewProfile}
                />
              )}
            </div>
          ) : (
            <EmptyEmployeeTable
              resetFilters={resetFilters}
              setIsInviteModalOpen={setIsInviteModalOpen}
            />
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {/* <AnimatePresence>
        {showFilterModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='bg-white rounded-lg shadow-xl w-full max-w-lg mx-4'
            >
              <div className='px-6 py-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Filter Employees
                  </h3>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className='text-gray-400 hover:text-gray-600'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </div>
              </div>

              <div className='p-6'>
                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Department
                    </label>
                    <select
                      value={filters.department}
                      onChange={(e) =>
                        setFilters({ ...filters, department: e.target.value })
                      }
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='all'>All Departments</option>
                      {[...new Set(employees.map((emp) => emp.department))].map(
                        (dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='all'>All Statuses</option>
                      <option value='active'>Active</option>
                      <option value='on-leave'>On Leave</option>
                      <option value='terminated'>Terminated</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Location
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) =>
                        setFilters({ ...filters, location: e.target.value })
                      }
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='all'>All Locations</option>
                      {[...new Set(employees.map((emp) => emp.location))].map(
                        (loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Position
                    </label>
                    <select
                      value={filters.position}
                      onChange={(e) =>
                        setFilters({ ...filters, position: e.target.value })
                      }
                      className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='all'>All Positions</option>
                      {[...new Set(employees.map((emp) => emp.position))].map(
                        (pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className='px-6 py-4 border-t border-gray-200 flex justify-between'>
                <button
                  onClick={resetFilters}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
                >
                  Reset Filters
                </button>
                <button
                  onClick={applyFilters}
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence> */}

      {/* Quick view sidebar */}
      <AnimatePresence>
        {showQuickView && activeEmployee && (
          <EmployeeDetailsView
            activeEmployee={activeEmployee}
            setShowQuickView={setShowQuickView}
          />
        )}
      </AnimatePresence>

      {/* Invite employee modal */}
      <InviteEmployeeModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};

export default Employees;
