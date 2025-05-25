import { useState, useEffect } from 'react';
import { UserPlus, Grid, List } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import InviteEmployeeModal from '../../components/Employee/EmployeeModals/InviteEmployeeModal';
import { useAuth } from '../../context/AuthProvider';
import {
  ExportEmployees,
  GetEmployeesByFilter,
  GetEmployeesByWorkspace,
} from '../../services/Employee';
import { TEmployee } from '../../types/Employee';
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
  const sortOptions = [
    { id: 'name-asc', label: 'Name (A-Z)', sortBy: 'name', sort: 'asc' },
    { id: 'name-desc', label: 'Name (Z-A)', sortBy: 'name', sort: 'desc' },
  ];
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [employees, setEmployees] = useState<TEmployee[]>([]);
  const [currentSort, setCurrentSort] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  const initialEmployeeFilters = {
    hireDate: { min: '', max: '' },
    status: 'all',
    position: '',
    department: '',
  };

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

  // const clearFilterURLParams = () => {
  //   setSearchParams((prev) => {
  //     const newParams = new URLSearchParams(prev);
  //     newParams.delete('hireDateStart');
  //     newParams.delete('hireDateEnd');
  //     newParams.delete('status');
  //     newParams.delete('position');
  //     newParams.delete('department');
  //     return newParams;
  //   });
  // };

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

  const handleApplyFilters = (filters: any) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);

      const flatFilters: Record<string, string | number> = {
        hireDateMin: filters.hireDate.min,
        hireDateMax: filters.hireDate.max,
        status: filters.status !== 'all' ? filters.status : '',
        position: filters.position,
        department: filters.department,
      };

      Object.entries(flatFilters).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value.toString());
        } else {
          newParams.delete(key);
        }
      });

      return newParams;
    });
  };

  const fetchEmployees = async () => {
    try {
      const paramsObj: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        paramsObj[key] = value;
      });

      const hasAnyParam = Object.keys(paramsObj).length > 0;
      if (hasAnyParam) {
        const searchQueryString = new URLSearchParams(paramsObj).toString();
        console.log(searchQueryString);

        const response = await GetEmployeesByFilter(searchQueryString);
        setEmployees(response.data.payload);
      } else {
        const response = await GetEmployeesByWorkspace(
          user?.workspace.id as string
        );
        if (response.status === 200) {
          setEmployees(response.data.payload);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchParams]);

  const handleExportEmployees = async () => {
    try {
      const response = await ExportEmployees(user?.workspace.id as string);
      if (response.status !== 200) {
        console.log('Error exporting employees');
        return;
      }
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees_workspace_${user?.workspace.id}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export employees:', error);
    }
  };

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
              <ButtonIcon
                name='Export'
                icon={icons.exportIcon}
                handleBtnClick={handleExportEmployees}
              />
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
                  initialFilters={initialEmployeeFilters}
                  filterOptions={employeeFilterOptions}
                  setIsFilterModalOpen={setIsFilterModalOpen}
                  isFilterModalOpen={isFilterModalOpen}
                  onApply={handleApplyFilters}
                  // handleClearURLParams={clearFilterURLParams}
                />

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
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              ) : (
                <EmployeeTable
                  employees={employees}
                  getStatusBadge={getStatusBadge}
                />
              )}
            </div>
          ) : (
            <EmptyEmployeeTable
              setIsInviteModalOpen={setIsInviteModalOpen}
              filterOptions={employeeFilterOptions}
            />
          )}
        </div>
      </div>

      {/* Invite employee modal */}
      <InviteEmployeeModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};

export default Employees;
