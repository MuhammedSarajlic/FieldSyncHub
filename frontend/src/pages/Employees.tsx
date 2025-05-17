import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  MoreHorizontal,
  Sliders,
  Activity,
  Zap,
  Award,
  TrendingUp,
  TrendingDown,
  Grid,
  List,
  Download,
  ChevronRight,
  RefreshCw,
  User,
  Building,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import InviteEmployeeModal from '../components/Employee/EmployeeModals/InviteEmployeeModal';

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
    location: 'all',
    position: 'all',
    hireDate: 'all',
    certification: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  const headerRef = useRef(null);
  const filtersRef = useRef(null);

  // Sample data
  useEffect(() => {
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
          performance: 92,
          tasksCompleted: 245,
          availability: 'Available',
        },
        {
          id: 2,
          name: 'Michael Chen',
          email: 'michael.chen@example.com',
          phone: '(555) 234-5678',
          position: 'Service Manager',
          department: 'Management',
          status: 'active',
          location: 'West Region',
          hireDate: new Date(2021, 8, 10),
          certifications: ['Project Management', 'Leadership'],
          avatar: '/api/placeholder/40/40',
          performance: 88,
          tasksCompleted: 312,
          availability: 'On Call',
        },
        {
          id: 3,
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@example.com',
          phone: '(555) 345-6789',
          position: 'Technician',
          department: 'Field Service',
          status: 'active',
          location: 'South Region',
          hireDate: new Date(2023, 1, 20),
          certifications: ['HVAC Certified'],
          avatar: '/api/placeholder/40/40',
          performance: 76,
          tasksCompleted: 128,
          availability: 'Available',
        },
        {
          id: 4,
          name: 'David Kim',
          email: 'david.kim@example.com',
          phone: '(555) 456-7890',
          position: 'Customer Support',
          department: 'Office',
          status: 'active',
          location: 'Central Region',
          hireDate: new Date(2022, 11, 5),
          certifications: [],
          avatar: '/api/placeholder/40/40',
          performance: 84,
          tasksCompleted: 196,
          availability: 'Available',
        },
        {
          id: 5,
          name: 'Jessica Williams',
          email: 'jessica.williams@example.com',
          phone: '(555) 567-8901',
          position: 'Senior Technician',
          department: 'Field Service',
          status: 'on-leave',
          location: 'North Region',
          hireDate: new Date(2020, 6, 15),
          certifications: ['HVAC Master', 'Electrical Safety', 'Refrigeration'],
          avatar: '/api/placeholder/40/40',
          performance: 95,
          tasksCompleted: 402,
          availability: 'Unavailable',
        },
        {
          id: 6,
          name: 'Robert Taylor',
          email: 'robert.taylor@example.com',
          phone: '(555) 678-9012',
          position: 'Technician',
          department: 'Field Service',
          status: 'active',
          location: 'East Region',
          hireDate: new Date(2023, 4, 1),
          certifications: ['HVAC Certified'],
          avatar: '/api/placeholder/40/40',
          performance: 68,
          tasksCompleted: 87,
          availability: 'Available',
        },
        {
          id: 7,
          name: 'Amanda Wilson',
          email: 'amanda.wilson@example.com',
          phone: '(555) 789-0123',
          position: 'Office Manager',
          department: 'Office',
          status: 'active',
          location: 'Central Region',
          hireDate: new Date(2021, 2, 18),
          certifications: ['Administration', 'Bookkeeping'],
          avatar: '/api/placeholder/40/40',
          performance: 91,
          tasksCompleted: 275,
          availability: 'On Call',
        },
        {
          id: 8,
          name: 'Daniel Brown',
          email: 'daniel.brown@example.com',
          phone: '(555) 890-1234',
          position: 'Technician',
          department: 'Field Service',
          status: 'terminated',
          location: 'West Region',
          hireDate: new Date(2022, 7, 22),
          certifications: ['HVAC Certified'],
          avatar: '/api/placeholder/40/40',
          performance: 45,
          tasksCompleted: 63,
          availability: 'Unavailable',
        },
      ];
      setEmployees(sampleEmployees);
      setFilteredEmployees(sampleEmployees);
      setIsLoading(false);
    }, 500);
  }, []);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (filtersRef.current) {
        const offset = filtersRef.current.offsetTop;
        setIsScrolled(window.scrollY > offset);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply filters & search
  useEffect(() => {
    if (employees.length === 0) return;

    let results = [...employees];
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        results = results.filter((employee) => {
          if (key === 'hireDate') {
            const today = new Date();
            const hireDate = new Date(employee.hireDate);
            const daysDiff = Math.floor(
              (today - hireDate) / (1000 * 60 * 60 * 24)
            );
            switch (value) {
              case 'last30':
                return daysDiff <= 30;
              case 'last90':
                return daysDiff <= 90;
              case 'lastYear':
                return daysDiff <= 365;
              case 'moreThanYear':
                return daysDiff > 365;
              default:
                return true;
            }
          } else if (key === 'certification') {
            if (value === 'none') return employee.certifications.length === 0;
            return employee.certifications.includes(value);
          }
          return employee[key] === value;
        });
      }
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (employee) =>
          employee.name.toLowerCase().includes(term) ||
          employee.email.toLowerCase().includes(term) ||
          employee.position.toLowerCase().includes(term) ||
          employee.department.toLowerCase().includes(term) ||
          employee.location.toLowerCase().includes(term)
      );
    }

    results.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      } else {
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
    });

    setFilteredEmployees(results);
  }, [employees, filters, searchTerm, sortConfig]);

  // Helper functions
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800'
          >
            <span className='h-1.5 w-1.5 mr-1.5 rounded-full bg-emerald-500'></span>
            Active
          </motion.span>
        );
      case 'on-leave':
        return (
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800'
          >
            <span className='h-1.5 w-1.5 mr-1.5 rounded-full bg-amber-500'></span>
            On Leave
          </motion.span>
        );
      case 'terminated':
        return (
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800'
          >
            <span className='h-1.5 w-1.5 mr-1.5 rounded-full bg-rose-500'></span>
            Terminated
          </motion.span>
        );
      default:
        return (
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
          >
            <span className='h-1.5 w-1.5 mr-1.5 rounded-full bg-gray-500'></span>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </motion.span>
        );
    }
  };

  const getAvailabilityIndicator = (availability) => {
    switch (availability) {
      case 'Available':
        return (
          <motion.span
            whileHover={{ scale: 1.05 }}
            className='inline-flex items-center text-xs font-medium text-emerald-600'
          >
            <span className='h-2 w-2 mr-1.5 rounded-full bg-emerald-500 animate-pulse'></span>
            {availability}
          </motion.span>
        );
      case 'On Call':
        return (
          <motion.span
            whileHover={{ scale: 1.05 }}
            className='inline-flex items-center text-xs font-medium text-blue-600'
          >
            <span className='h-2 w-2 mr-1.5 rounded-full bg-blue-500'></span>
            {availability}
          </motion.span>
        );
      case 'Unavailable':
        return (
          <motion.span
            whileHover={{ scale: 1.05 }}
            className='inline-flex items-center text-xs font-medium text-rose-600'
          >
            <span className='h-2 w-2 mr-1.5 rounded-full bg-rose-500'></span>
            {availability}
          </motion.span>
        );
      default:
        return (
          <motion.span
            whileHover={{ scale: 1.05 }}
            className='inline-flex items-center text-xs font-medium text-gray-600'
          >
            <span className='h-2 w-2 mr-1.5 rounded-full bg-gray-500'></span>
            {availability}
          </motion.span>
        );
    }
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
      hireDate: 'all',
      certification: 'all',
    });
    setSearchTerm('');
  };

  return (
    <div className='flex h-screen overflow-hidden bg-gray-50'>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden ml-[260px]'>
        <Navbar />

        <div className='flex-1 overflow-y-auto pb-10'>
          {/* Hero header with animated gradient */}
          <div className='relative h-64 bg-gradient-to-br from-indigo-900 to-purple-900 overflow-hidden'>
            {/* Animated background elements */}
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 to-transparent'></div>
            <div className='absolute inset-0 bg-grid-white/[0.03]'></div>

            {/* Floating particles animation */}
            <div className='absolute inset-0 opacity-30'>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    opacity: 0,
                  }}
                  animate={{
                    x: [null, Math.random() * 100],
                    y: [null, Math.random() * 100],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 10 + Math.random() * 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'linear',
                  }}
                  className='absolute w-1 h-1 rounded-full bg-white'
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>

            <div className='relative h-full flex items-end pb-8 px-8'>
              <div className='max-w-7xl w-full mx-auto'>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className='flex flex-col md:flex-row justify-between items-start md:items-end gap-6'
                >
                  <div>
                    <h1 className='text-4xl font-bold text-white mb-2 tracking-tight'>
                      Team Management
                    </h1>
                    <p className='text-indigo-200 text-lg max-w-2xl'>
                      Optimize your workforce with intelligent insights and
                      seamless control
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsInviteModalOpen(true)}
                    className='flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all shadow-lg hover:shadow-xl'
                  >
                    <UserPlus className='h-5 w-5' />
                    <span>Invite Team Member</span>
                    <ChevronRight className='h-4 w-4' />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 -mt-10 px-4 sm:px-6 lg:px-8'
          >
            {[
              {
                title: 'Team Members',
                value: employees.filter((e) => e.status !== 'terminated')
                  .length,
                icon: Users,
                color: 'blue',
                trend: '+2% from last month',
                trendValue: '+2%',
                trendPositive: true,
              },
              {
                title: 'Active',
                value: employees.filter((e) => e.status === 'active').length,
                icon: UserCheck,
                color: 'emerald',
                trend: 'Productivity',
                trendValue: '96%',
                trendPositive: true,
              },
              {
                title: 'On Leave',
                value: employees.filter((e) => e.status === 'on-leave').length,
                icon: Clock,
                color: 'amber',
                trend: 'Returning',
                trendValue: 'in 7d',
                trendPositive: false,
              },
              {
                title: 'Performance',
                value: `${Math.round(
                  employees.reduce((sum, emp) => sum + emp.performance, 0) /
                    employees.length
                )}`,
                icon: Award,
                color: 'purple',
                trend: 'vs Target',
                trendValue: '+5%',
                trendPositive: true,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className='bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-lg group relative'
              >
                <div className='absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                <div className='relative p-6'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='text-sm font-medium text-gray-500'>
                        {stat.title}
                      </p>
                      <h3 className='text-3xl font-bold text-gray-900 mt-1'>
                        {stat.value}
                        {stat.title === 'Performance' && (
                          <span className='text-xl'>%</span>
                        )}
                      </h3>
                    </div>
                    <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>

                  <div className='mt-4 flex items-center'>
                    <div
                      className={`flex items-center text-sm font-medium ${
                        stat.trendPositive
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {stat.trendPositive ? (
                        <TrendingUp className='h-4 w-4 mr-1' />
                      ) : (
                        <TrendingDown className='h-4 w-4 mr-1' />
                      )}
                      <span>{stat.trendValue}</span>
                    </div>
                    <span className='text-xs text-gray-500 ml-2'>
                      {stat.trend}
                    </span>
                  </div>

                  {/* Animated progress bar */}
                  <div className='mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.trendPositive ? 85 : 30}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full ${
                        stat.trendPositive ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Search and filters section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='mt-8 px-4 sm:px-6 lg:px-8'
          >
            <div className='bg-white rounded-2xl shadow-sm p-6 border border-gray-100'>
              <div className='flex flex-col md:flex-row gap-4 justify-between items-center'>
                {/* Enhanced search with floating label */}
                <div className='relative w-full md:w-96'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Search className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    className='block w-full pl-10 pr-3 py-3 border-0 bg-gray-50 rounded-xl leading-5 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm transition-all duration-200 peer'
                    placeholder=' '
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <label className='absolute left-10 top-1.5 text-xs text-gray-500 transition-all duration-200 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-gray-500 pointer-events-none'>
                    Search employees...
                  </label>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    >
                      <X className='h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors' />
                    </button>
                  )}
                </div>

                <div className='flex items-center gap-3 w-full md:w-auto justify-end'>
                  {/* Filter button with indicator */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowFilters(!showFilters)}
                    className='relative inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200'
                  >
                    <Sliders className='h-4 w-4 mr-2 text-gray-500' />
                    Filters
                    {Object.values(filters).some((val) => val !== 'all') && (
                      <span className='absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center'>
                        {
                          Object.values(filters).filter((val) => val !== 'all')
                            .length
                        }
                      </span>
                    )}
                  </motion.button>

                  {/* View toggle with smooth transition */}
                  <div className='flex items-center bg-gray-50 rounded-xl p-1'>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-all rounded-lg ${
                        viewMode === 'grid'
                          ? 'bg-white shadow-sm text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Grid className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition-all rounded-lg ${
                        viewMode === 'list'
                          ? 'bg-white shadow-sm text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <List className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced filters dropdown */}
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25 }}
                  className='overflow-hidden'
                >
                  <div
                    ref={filtersRef}
                    className='mt-5 pt-5 border-t border-gray-200'
                  >
                    <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                      {[
                        {
                          label: 'Department',
                          key: 'department',
                          icon: Briefcase,
                          options: [
                            'all',
                            ...new Set(employees.map((emp) => emp.department)),
                          ],
                        },
                        {
                          label: 'Status',
                          key: 'status',
                          icon: Activity,
                          options: ['all', 'active', 'on-leave', 'terminated'],
                        },
                        {
                          label: 'Location',
                          key: 'location',
                          icon: MapPin,
                          options: [
                            'all',
                            ...new Set(employees.map((emp) => emp.location)),
                          ],
                        },
                        {
                          label: 'Position',
                          key: 'position',
                          icon: Award,
                          options: [
                            'all',
                            ...new Set(employees.map((emp) => emp.position)),
                          ],
                        },
                        {
                          label: 'Hire Date',
                          key: 'hireDate',
                          icon: Calendar,
                          options: [
                            'all',
                            'last30',
                            'last90',
                            'lastYear',
                            'moreThanYear',
                          ],
                        },
                        {
                          label: 'Certification',
                          key: 'certification',
                          icon: Zap,
                          options: [
                            'all',
                            ...new Set(
                              employees.flatMap((emp) => emp.certifications)
                            ),
                            'none',
                          ],
                        },
                      ].map((filter, index) => (
                        <div key={index} className='relative'>
                          <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center'>
                            <filter.icon className='h-3 w-3 mr-1.5' />
                            {filter.label}
                          </label>
                          <div className='relative'>
                            <select
                              value={filters[filter.key]}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  [filter.key]: e.target.value,
                                })
                              }
                              className='appearance-none block w-full pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                            >
                              {filter.options.map((option, idx) => (
                                <option key={idx} value={option}>
                                  {option === 'all'
                                    ? `All ${
                                        filter.label === 'Status'
                                          ? 'Statuses'
                                          : filter.label + 's'
                                      }`
                                    : option === 'none'
                                    ? 'No Certifications'
                                    : option.charAt(0).toUpperCase() +
                                      option.slice(1)}
                                </option>
                              ))}
                            </select>
                            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500'>
                              <ChevronDown className='h-4 w-4' />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className='mt-4 flex justify-between items-center'>
                      <button
                        onClick={resetFilters}
                        className='text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center transition-colors'
                      >
                        <RefreshCw className='h-3.5 w-3.5 mr-1.5' />
                        Reset All Filters
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className='text-sm font-medium text-gray-700 hover:text-gray-900 inline-flex items-center transition-colors'
                      >
                        Apply Filters
                        <ChevronRight className='h-4 w-4 ml-1' />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Sticky controls bar */}
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className='sticky top-0 z-20 bg-white shadow-md border-b border-gray-200 py-3 px-4 backdrop-blur-sm bg-opacity-95 transition-all duration-300'
            >
              <div className='flex items-center justify-between max-w-7xl mx-auto'>
                <div className='flex items-center space-x-4'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    {filteredEmployees.length} Employees
                  </h3>
                  {searchTerm && (
                    <div className='bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-lg flex items-center'>
                      <Search className='h-3 w-3 mr-1' />
                      {searchTerm}
                      <button
                        onClick={() => setSearchTerm('')}
                        className='ml-2'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  )}
                  {Object.entries(filters).some(
                    ([key, value]) => value !== 'all'
                  ) && (
                    <button
                      onClick={resetFilters}
                      className='text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center transition-colors'
                    >
                      <RefreshCw className='h-3 w-3 mr-1' />
                      Clear Filters
                    </button>
                  )}
                </div>

                <div className='flex items-center space-x-2'>
                  <button className='text-gray-500 hover:text-gray-700 p-2 transition-colors'>
                    <Download className='h-4 w-4' />
                  </button>
                  <button
                    onClick={() =>
                      setViewMode(viewMode === 'grid' ? 'list' : 'grid')
                    }
                    className='text-gray-500 hover:text-gray-700 p-2 transition-colors'
                  >
                    {viewMode === 'grid' ? (
                      <List className='h-4 w-4' />
                    ) : (
                      <Grid className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Employee list section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='mt-6 px-4 sm:px-6 lg:px-8'
          >
            {isLoading ? (
              <div className='flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm p-8'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4'></div>
                <p className='text-gray-600'>Loading employee data...</p>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <div>
                {/* View options and count */}
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-medium text-gray-900'>
                    Team Members{' '}
                    <span className='text-gray-500'>
                      ({filteredEmployees.length})
                    </span>
                  </h2>
                  <div className='flex items-center space-x-2'>
                    <button className='text-sm text-gray-500 hover:text-blue-600 flex items-center transition-colors'>
                      <Download className='h-4 w-4 mr-1' />
                      Export
                    </button>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                    {filteredEmployees.map((employee) => (
                      <motion.div
                        key={employee.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -5 }}
                        className='bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 group relative isolate'
                      >
                        {/* Background pattern */}
                        <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                        {/* Status ribbon */}
                        <div className='absolute top-3 right-3 z-10'>
                          {getStatusBadge(employee.status)}
                        </div>

                        {/* Avatar with halo effect */}
                        <div className='flex justify-center pt-6 pb-2 relative'>
                          <div className='relative'>
                            <div className='absolute inset-0 rounded-full bg-blue-200 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300 -z-10'></div>
                            <img
                              src={employee.avatar}
                              alt={employee.name}
                              className='h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300'
                            />
                            <div className='absolute bottom-0 right-0'>
                              {getAvailabilityIndicator(employee.availability)}
                            </div>
                          </div>
                        </div>

                        {/* Employee info */}
                        <div className='p-5 pt-2'>
                          <div className='text-center mb-4'>
                            <h3 className='text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                              {employee.name}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {employee.position}
                            </p>
                          </div>

                          {/* Stats bubbles */}
                          <div className='flex justify-center gap-3 mb-5'>
                            <div className='flex flex-col items-center'>
                              <div className='h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold'>
                                {employee.performance}%
                              </div>
                              <span className='text-xs text-gray-500 mt-1'>
                                Perf.
                              </span>
                            </div>
                            <div className='flex flex-col items-center'>
                              <div className='h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold'>
                                {employee.tasksCompleted}
                              </div>
                              <span className='text-xs text-gray-500 mt-1'>
                                Tasks
                              </span>
                            </div>
                            <div className='flex flex-col items-center'>
                              <div className='h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-xs font-bold'>
                                {employee.certifications.length}
                              </div>
                              <span className='text-xs text-gray-500 mt-1'>
                                Certs
                              </span>
                            </div>
                          </div>

                          {/* Quick info */}
                          <div className='space-y-2.5'>
                            <div className='flex items-center text-sm'>
                              <Mail className='h-4 w-4 text-gray-400 mr-2 flex-shrink-0' />
                              <span className='truncate'>{employee.email}</span>
                            </div>
                            <div className='flex items-center text-sm'>
                              <MapPin className='h-4 w-4 text-gray-400 mr-2 flex-shrink-0' />
                              <span>{employee.location}</span>
                            </div>
                            <div className='flex items-center text-sm'>
                              <Calendar className='h-4 w-4 text-gray-400 mr-2 flex-shrink-0' />
                              <span>Since {formatDate(employee.hireDate)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions footer */}
                        <div className='px-5 py-3 border-t border-gray-100 bg-gray-50/50 group-hover:bg-white transition-colors'>
                          <div className='flex justify-between items-center'>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleViewProfile(employee)}
                              className='text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center'
                            >
                              Quick View
                              <ChevronRight className='h-4 w-4 ml-1' />
                            </motion.button>

                            <div className='flex space-x-1'>
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                className='p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all'
                              >
                                <Mail className='h-4 w-4' />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                className='p-1.5 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50 transition-all'
                              >
                                <Phone className='h-4 w-4' />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100'>
                    <div className='overflow-x-auto'>
                      <table className='min-w-full divide-y divide-gray-200'>
                        <thead className='bg-gray-50'>
                          <tr>
                            {[
                              'Employee',
                              'Position',
                              'Department',
                              'Location',
                              'Status',
                              'Performance',
                              'Hire Date',
                              'Actions',
                            ].map((header, index) => (
                              <th
                                key={index}
                                scope='col'
                                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                          {filteredEmployees.map((employee, idx) => (
                            <motion.tr
                              key={employee.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: idx * 0.05,
                              }}
                              className={
                                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              }
                            >
                              <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='flex items-center'>
                                  <div className='flex-shrink-0 h-10 w-10 relative'>
                                    <img
                                      src={employee.avatar}
                                      alt={employee.name}
                                      className='h-10 w-10 rounded-full'
                                    />
                                    <div className='absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500'></div>
                                  </div>
                                  <div className='ml-4'>
                                    <div className='text-sm font-medium text-gray-900'>
                                      {employee.name}
                                    </div>
                                    <div className='text-sm text-gray-500'>
                                      {employee.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='text-sm text-gray-900'>
                                  {employee.position}
                                </div>
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='text-sm text-gray-900'>
                                  {employee.department}
                                </div>
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='text-sm text-gray-900'>
                                  {employee.location}
                                </div>
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap'>
                                {getStatusBadge(employee.status)}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap'>
                                <div className='flex items-center'>
                                  <span className='text-sm text-gray-900 mr-2'>
                                    {employee.performance}%
                                  </span>
                                  <div className='w-24 bg-gray-200 rounded-full h-1.5'>
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        employee.performance >= 90
                                          ? 'bg-emerald-500'
                                          : employee.performance >= 75
                                          ? 'bg-blue-500'
                                          : employee.performance >= 50
                                          ? 'bg-amber-500'
                                          : 'bg-rose-500'
                                      }`}
                                      style={{
                                        width: `${employee.performance}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                {formatDate(employee.hireDate)}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                <div className='flex space-x-1 justify-end'>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => handleViewProfile(employee)}
                                    className='text-blue-600 hover:text-blue-900 p-1'
                                  >
                                    View
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    className='text-gray-500 hover:text-gray-700 p-1'
                                  >
                                    <MoreHorizontal className='h-4 w-4' />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='bg-white rounded-xl shadow-sm p-12 text-center'
              >
                <div className='mx-auto h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center'>
                  <Users className='h-10 w-10 text-blue-500' />
                </div>
                <h3 className='mt-4 text-lg font-medium text-gray-900'>
                  No employees found
                </h3>
                <p className='mt-2 text-sm text-gray-500 max-w-md mx-auto'>
                  No employees match your current filter criteria. Try adjusting
                  your search or filters, or invite new team members to your
                  organization.
                </p>
                <div className='mt-6'>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetFilters}
                    className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3'
                  >
                    Clear Filters
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsInviteModalOpen(true)}
                    className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    <UserPlus className='h-4 w-4 mr-2' />
                    Invite Employee
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Quick view sidebar */}
      <AnimatePresence>
        {showQuickView && activeEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex justify-end'
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className='w-full max-w-md bg-white h-full overflow-auto shadow-2xl'
            >
              {/* Header with gradient */}
              <div className='sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-xl font-bold'>Employee Profile</h2>
                  <button
                    onClick={() => setShowQuickView(false)}
                    className='rounded-full p-1 hover:bg-white/10 transition-colors'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </div>

                <div className='flex items-center gap-5'>
                  <div className='relative'>
                    <img
                      src={activeEmployee.avatar}
                      alt={activeEmployee.name}
                      className='h-16 w-16 rounded-full border-4 border-white/30 shadow-lg'
                    />
                    <div className='absolute -bottom-1 -right-1'>
                      {getAvailabilityIndicator(activeEmployee.availability)}
                    </div>
                  </div>
                  <div>
                    <h3 className='text-xl font-bold'>{activeEmployee.name}</h3>
                    <p className='text-indigo-100'>{activeEmployee.position}</p>
                  </div>
                </div>
              </div>

              <div className='p-6'>
                {/* Performance meter */}
                <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6'>
                  <div className='flex justify-between items-center mb-3'>
                    <h4 className='text-sm font-semibold text-gray-700'>
                      Performance
                    </h4>
                    <span
                      className={`text-lg font-bold ${
                        activeEmployee.performance >= 90
                          ? 'text-emerald-600'
                          : activeEmployee.performance >= 75
                          ? 'text-blue-600'
                          : activeEmployee.performance >= 50
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {activeEmployee.performance}%
                    </span>
                  </div>

                  <div className='relative'>
                    <div className='w-full bg-gray-100 rounded-full h-2.5'>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${activeEmployee.performance}%` }}
                        transition={{ duration: 1 }}
                        className={`h-2.5 rounded-full ${
                          activeEmployee.performance >= 90
                            ? 'bg-emerald-500'
                            : activeEmployee.performance >= 75
                            ? 'bg-blue-500'
                            : activeEmployee.performance >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>

                    {/* Performance markers */}
                    <div className='flex justify-between mt-1.5'>
                      {[0, 25, 50, 75, 100].map((mark) => (
                        <div key={mark} className='relative'>
                          <div className='h-2 w-px bg-gray-200 absolute -top-3.5 left-1/2'></div>
                          <span className='text-xs text-gray-500 absolute -top-6 left-1/2 transform -translate-x-1/2'>
                            {mark}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='mt-4 grid grid-cols-3 gap-3 text-center'>
                    <div>
                      <div className='text-2xl font-bold text-gray-900'>
                        {activeEmployee.tasksCompleted}
                      </div>
                      <div className='text-xs text-gray-500'>Tasks</div>
                    </div>
                    <div>
                      <div className='text-2xl font-bold text-gray-900'>
                        {activeEmployee.certifications.length}
                      </div>
                      <div className='text-xs text-gray-500'>Certs</div>
                    </div>
                    <div>
                      <div className='text-2xl font-bold text-gray-900'>
                        {Math.floor(
                          (new Date() - new Date(activeEmployee.hireDate)) /
                            (1000 * 60 * 60 * 24 * 30)
                        )}
                      </div>
                      <div className='text-xs text-gray-500'>Months</div>
                    </div>
                  </div>
                </div>

                {/* Info sections */}
                <div className='grid grid-cols-1 gap-5'>
                  <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-5'>
                    <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center'>
                      <User className='h-4 w-4 mr-2 text-gray-500' />
                      Personal Info
                    </h4>
                    <div className='space-y-3'>
                      <div className='flex items-start'>
                        <Mail className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm text-gray-900'>
                            {activeEmployee.email}
                          </p>
                          <p className='text-xs text-gray-500'>Email</p>
                        </div>
                      </div>
                      <div className='flex items-start'>
                        <Phone className='h-5 w-5 text-gray-400 mr-3 mt=0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm text-gray-900'>
                            {activeEmployee.phone}
                          </p>
                          <p className='text-xs text-gray-500'>Phone</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-5'>
                    <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center'>
                      <Briefcase className='h-4 w-4 mr-2 text-gray-500' />
                      Work Details
                    </h4>
                    <div className='space-y-3'>
                      <div className='flex items-start'>
                        <Building className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm text-gray-900'>
                            {activeEmployee.department}
                          </p>
                          <p className='text-xs text-gray-500'>Department</p>
                        </div>
                      </div>
                      <div className='flex items-start'>
                        <MapPin className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm text-gray-900'>
                            {activeEmployee.location}
                          </p>
                          <p className='text-xs text-gray-500'>Location</p>
                        </div>
                      </div>
                      <div className='flex items-start'>
                        <Calendar className='h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm text-gray-900'>
                            {formatDate(activeEmployee.hireDate)}
                          </p>
                          <p className='text-xs text-gray-500'>Hire Date</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {activeEmployee.certifications.length > 0 && (
                    <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-5'>
                      <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center'>
                        <Award className='h-4 w-4 mr-2 text-gray-500' />
                        Certifications
                      </h4>
                      <div className='flex flex-wrap gap-2'>
                        {activeEmployee.certifications.map((cert, idx) => (
                          <motion.span
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100'
                          >
                            {cert}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className='mt-8 grid grid-cols-2 gap-3'>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
                  >
                    <Mail className='h-4 w-4' />
                    Message
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='flex items-center justify-center gap-2 px-4 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'
                  >
                    Full Profile
                    <ChevronRight className='h-4 w-4' />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite employee modal */}
      <InviteEmployeeModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={(data) => {
          console.log('Invite data:', data);
          setIsInviteModalOpen(false);
        }}
      />
    </div>
  );
};

export default Employees;
