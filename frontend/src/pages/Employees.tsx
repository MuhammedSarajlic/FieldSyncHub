import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Users,
  UserCheck,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
} from 'lucide-react';

const Employees = () => {
  // State management
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc',
  });
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - kept minimal
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleEmployees = [
        {
          id: 1,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '(555) 123-4567',
          position: 'Lead Technician',
          department: 'Field Service',
          status: 'active',
          location: 'East Region',
          hireDate: new Date(2022, 3, 15),
          certifications: ['HVAC Master', 'Electrical Safety'],
          avatar: '/api/placeholder/40/40',
        },
        {
          id: 2,
          name: 'Michael Chen',
          email: 'michael.chen@example.com',
          phone: '(555) 987-6543',
          position: 'Service Technician',
          department: 'Field Service',
          status: 'active',
          location: 'North Region',
          hireDate: new Date(2023, 1, 10),
          certifications: ['Plumbing', 'HVAC Basic'],
          avatar: '/api/placeholder/40/40',
        },
        {
          id: 3,
          name: 'Jessica Miller',
          email: 'jessica.miller@example.com',
          phone: '(555) 234-5678',
          position: 'Administrative Assistant',
          department: 'Office',
          status: 'active',
          location: 'Headquarters',
          hireDate: new Date(2021, 8, 5),
          certifications: [],
          avatar: '/api/placeholder/40/40',
        },
        {
          id: 4,
          name: 'David Rodriguez',
          email: 'david.rodriguez@example.com',
          phone: '(555) 876-5432',
          position: 'HVAC Specialist',
          department: 'Field Service',
          status: 'on-leave',
          location: 'West Region',
          hireDate: new Date(2020, 5, 20),
          certifications: ['HVAC Master', 'Safety Compliance'],
          avatar: '/api/placeholder/40/40',
        },
        {
          id: 5,
          name: 'Robert Williams',
          email: 'robert.williams@example.com',
          phone: '(555) 345-6789',
          position: 'Dispatcher',
          department: 'Operations',
          status: 'active',
          location: 'Headquarters',
          hireDate: new Date(2022, 0, 3),
          certifications: ['Dispatch Management'],
          avatar: '/api/placeholder/40/40',
        },
      ];

      setEmployees(sampleEmployees);
      setFilteredEmployees(sampleEmployees);
      setIsLoading(false);
    }, 500);
  }, []);

  // Apply filters & search
  useEffect(() => {
    if (employees.length === 0) return;

    let results = [...employees];

    // Apply department filter
    if (filters.department !== 'all') {
      results = results.filter(
        (employee) => employee.department === filters.department
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      results = results.filter(
        (employee) => employee.status === filters.status
      );
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (employee) =>
          employee.name.toLowerCase().includes(term) ||
          employee.email.toLowerCase().includes(term) ||
          employee.position.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    results.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      } else {
        // String comparison
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
    });

    setFilteredEmployees(results);
  }, [employees, filters, searchTerm, sortConfig]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get unique departments for filter dropdown
  const departments = [
    'all',
    ...new Set(employees.map((emp) => emp.department)),
  ];

  // Helper functions
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            <span className='h-1.5 w-1.5 mr-1.5 rounded-full bg-green-600'></span>
            Active
          </span>
        );
      case 'on-leave':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
            <span className='h-1.5 w-1.5 mr-1.5 rounded-full bg-yellow-600'></span>
            On Leave
          </span>
        );
      case 'terminated':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            <span className='h-1.5 w-1.5 mr-1.5 rounded-full bg-red-600'></span>
            Terminated
          </span>
        );
      default:
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            <span className='h-1.5 w-1.5 mr-1.5 rounded-full bg-gray-500'></span>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <div>
          <Navbar />
        </div>

        <div className='p-6 h-full bg-gray-50'>
          {/* Header with summary stats */}
          <div className='mb-8'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>Employees</h1>
                <p className='mt-1 text-gray-600 max-w-3xl'>
                  Manage your team members and their information
                </p>
              </div>
              <div className='mt-4 lg:mt-0'>
                <button className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                  <UserPlus className='h-4 w-4 mr-2' />
                  Add Employee
                </button>
              </div>
            </div>

            {/* Stats cards */}
            <div className='mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='px-4 py-5 sm:p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 bg-blue-100 rounded-md p-3'>
                      <Users className='h-6 w-6 text-blue-600' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          Total Employees
                        </dt>
                        <dd className='flex items-center text-lg font-semibold text-gray-900'>
                          {
                            employees.filter((e) => e.status !== 'terminated')
                              .length
                          }
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='px-4 py-5 sm:p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 bg-green-100 rounded-md p-3'>
                      <UserCheck className='h-6 w-6 text-green-600' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          Active Employees
                        </dt>
                        <dd className='flex items-center text-lg font-semibold text-gray-900'>
                          {
                            employees.filter((e) => e.status === 'active')
                              .length
                          }
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='px-4 py-5 sm:p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 bg-yellow-100 rounded-md p-3'>
                      <Clock className='h-6 w-6 text-yellow-600' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          On Leave
                        </dt>
                        <dd className='flex items-center text-lg font-semibold text-gray-900'>
                          {
                            employees.filter((e) => e.status === 'on-leave')
                              .length
                          }
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and filters */}
          <div className='mb-6'>
            <div className='bg-white shadow rounded-lg p-6'>
              <div className='flex flex-col md:flex-row gap-4 justify-between'>
                <div className='relative md:w-96'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Search className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    placeholder='Search employees...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className='flex flex-wrap items-center gap-3'>
                  <select
                    value={filters.department}
                    onChange={(e) =>
                      setFilters({ ...filters, department: e.target.value })
                    }
                    className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
                  >
                    <option value='all'>All Departments</option>
                    {departments
                      .filter((d) => d !== 'all')
                      .map((dept, idx) => (
                        <option key={idx} value={dept}>
                          {dept}
                        </option>
                      ))}
                  </select>

                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
                  >
                    <option value='all'>All Statuses</option>
                    <option value='active'>Active</option>
                    <option value='on-leave'>On Leave</option>
                    <option value='terminated'>Terminated</option>
                  </select>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    <Filter className='h-4 w-4 mr-2 text-gray-500' />
                    More Filters
                    {showFilters ? (
                      <ChevronUp className='ml-2 h-4 w-4' />
                    ) : (
                      <ChevronDown className='ml-2 h-4 w-4' />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setFilters({
                        department: 'all',
                        status: 'all',
                      });
                      setSearchTerm('');
                    }}
                    className='text-sm text-blue-600 hover:text-blue-900'
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className='mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Location
                    </label>
                    <select className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'>
                      <option>All Locations</option>
                      <option>Headquarters</option>
                      <option>East Region</option>
                      <option>West Region</option>
                      <option>North Region</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Position
                    </label>
                    <select className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'>
                      <option>All Positions</option>
                      <option>Technician</option>
                      <option>Administrative</option>
                      <option>Specialist</option>
                      <option>Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Hire Date
                    </label>
                    <select className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'>
                      <option>Any Time</option>
                      <option>Last 30 Days</option>
                      <option>Last 90 Days</option>
                      <option>Last Year</option>
                      <option>More than 1 Year</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Certification
                    </label>
                    <select className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'>
                      <option>Any Certification</option>
                      <option>HVAC Master</option>
                      <option>Plumbing</option>
                      <option>Electrical Safety</option>
                      <option>No Certifications</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employee cards grid */}
          <div className='space-y-4'>
            {/* Section title with toggle view option */}
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-medium text-gray-900'>
                Team Members ({filteredEmployees.length})
              </h2>
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-500'>View:</span>
                <button className='p-1.5 bg-blue-100 text-blue-600 rounded'>
                  <Users className='h-4 w-4' />
                </button>
                <button className='p-1.5 text-gray-500 hover:text-gray-700'>
                  <div className='w-4 h-4 flex flex-col justify-between'>
                    <div className='h-0.5 w-full bg-current'></div>
                    <div className='h-0.5 w-full bg-current'></div>
                    <div className='h-0.5 w-full bg-current'></div>
                  </div>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className='flex justify-center items-center h-64'>
                <div
                  className='spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent'
                  role='status'
                >
                  <span className='visually-hidden'>Loading...</span>
                </div>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className='bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300'
                  >
                    <div className='p-5'>
                      <div className='flex items-center space-x-4'>
                        <img
                          src={employee.avatar}
                          alt={employee.name}
                          className='h-12 w-12 rounded-full object-cover border-2 border-gray-200'
                        />
                        <div>
                          <h3 className='text-lg font-medium text-gray-900'>
                            {employee.name}
                          </h3>
                          <p className='text-sm text-gray-500'>
                            {employee.position}
                          </p>
                        </div>
                      </div>

                      <div className='mt-6 space-y-4'>
                        <div className='flex items-start'>
                          <Mail className='h-5 w-5 text-gray-400 mr-2 mt-0.5' />
                          <span className='text-sm text-gray-600'>
                            {employee.email}
                          </span>
                        </div>

                        <div className='flex items-start'>
                          <Phone className='h-5 w-5 text-gray-400 mr-2 mt-0.5' />
                          <span className='text-sm text-gray-600'>
                            {employee.phone}
                          </span>
                        </div>

                        <div className='flex items-start'>
                          <Briefcase className='h-5 w-5 text-gray-400 mr-2 mt-0.5' />
                          <span className='text-sm text-gray-600'>
                            {employee.department}
                          </span>
                        </div>

                        <div className='flex items-start'>
                          <MapPin className='h-5 w-5 text-gray-400 mr-2 mt-0.5' />
                          <span className='text-sm text-gray-600'>
                            {employee.location}
                          </span>
                        </div>

                        <div className='flex items-start'>
                          <Calendar className='h-5 w-5 text-gray-400 mr-2 mt-0.5' />
                          <span className='text-sm text-gray-600'>
                            Hired {formatDate(employee.hireDate)}
                          </span>
                        </div>
                      </div>

                      <div className='mt-6 flex items-center justify-between'>
                        {getStatusBadge(employee.status)}

                        <div>
                          {employee.certifications.length > 0 && (
                            <div className='flex flex-wrap gap-1'>
                              {employee.certifications
                                .slice(0, 2)
                                .map((cert, idx) => (
                                  <span
                                    key={idx}
                                    className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'
                                  >
                                    {cert}
                                  </span>
                                ))}
                              {employee.certifications.length > 2 && (
                                <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'>
                                  +{employee.certifications.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='bg-gray-50 px-5 py-3 border-t border-gray-200'>
                      <div className='flex justify-between items-center'>
                        <button className='text-sm font-medium text-blue-600 hover:text-blue-800'>
                          View Profile
                        </button>
                        <button className='text-sm font-medium text-gray-500 hover:text-gray-700'>
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='bg-white shadow rounded-lg p-6 text-center'>
                <Users className='h-12 w-12 text-gray-400 mx-auto' />
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  No employees found
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
