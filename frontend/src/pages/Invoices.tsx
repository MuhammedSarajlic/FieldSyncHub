import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Edit,
  Trash,
  Share,
  Printer,
  ExternalLink,
} from 'lucide-react';

const Invoices = () => {
  // State management
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc',
  });
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: '30',
    minAmount: '',
    maxAmount: '',
    customer: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data (replace with your API fetch)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleInvoices = [
        {
          id: 'INV-2025-001',
          customer: 'Johnson Residence',
          customerEmail: 'johnson@example.com',
          jobId: 'JOB-2025-027',
          jobTitle: 'HVAC Installation',
          date: new Date(2025, 4, 1),
          dueDate: new Date(2025, 4, 15),
          amount: 2450.0,
          balance: 2450.0,
          status: 'unpaid',
          items: [
            {
              description: 'HVAC System - 3 Ton',
              quantity: 1,
              unitPrice: 1800,
              total: 1800,
            },
            {
              description: 'Installation Labor',
              quantity: 6,
              unitPrice: 95,
              total: 570,
            },
            {
              description: 'Disposal Fee',
              quantity: 1,
              unitPrice: 80,
              total: 80,
            },
          ],
          notes: 'Customer requested installation before summer season',
          paymentTerms: 'Net 14',
          tax: { rate: 0.0825, amount: 202.13 },
        },
        {
          id: 'INV-2025-002',
          customer: 'Greenview Apartments',
          customerEmail: 'manager@greenview.com',
          jobId: 'JOB-2025-029',
          jobTitle: 'Plumbing Repair - Multiple Units',
          date: new Date(2025, 4, 2),
          dueDate: new Date(2025, 5, 2),
          amount: 1250.0,
          balance: 0,
          status: 'paid',
          paymentDate: new Date(2025, 4, 20),
          paymentMethod: 'credit_card',
          items: [
            {
              description: 'Plumbing Labor',
              quantity: 8,
              unitPrice: 85,
              total: 680,
            },
            {
              description: 'Replacement Pipes',
              quantity: 12,
              unitPrice: 25,
              total: 300,
            },
            { description: 'Fixtures', quantity: 6, unitPrice: 45, total: 270 },
          ],
          notes: 'Emergency service call for multiple unit leaks',
          paymentTerms: 'Net 30',
          tax: { rate: 0.0825, amount: 103.13 },
        },
        {
          id: 'INV-2025-003',
          customer: 'Smith Office Building',
          customerEmail: 'operations@smithcompany.com',
          jobId: 'JOB-2025-031',
          jobTitle: 'Annual Electrical Inspection',
          date: new Date(2025, 4, 3),
          dueDate: new Date(2025, 4, 18),
          amount: 850.0,
          balance: 425.0,
          status: 'partial',
          paymentDate: new Date(2025, 4, 10),
          paymentMethod: 'check',
          paymentAmount: 425.0,
          items: [
            {
              description: 'Electrical Inspection',
              quantity: 1,
              unitPrice: 500,
              total: 500,
            },
            {
              description: 'Minor Repairs',
              quantity: 3,
              unitPrice: 75,
              total: 225,
            },
            {
              description: 'Safety Certification',
              quantity: 1,
              unitPrice: 125,
              total: 125,
            },
          ],
          notes: 'Annual inspection required by building code',
          paymentTerms: 'Net 15',
          tax: { rate: 0, amount: 0 },
        },
        {
          id: 'INV-2025-004',
          customer: 'Peterson Residence',
          customerEmail: 'peterson@gmail.com',
          jobId: 'JOB-2025-036',
          jobTitle: 'Water Heater Replacement',
          date: new Date(2025, 4, 5),
          dueDate: new Date(2025, 4, 19),
          amount: 1175.0,
          balance: 1175.0,
          status: 'overdue',
          items: [
            {
              description: '50 Gallon Water Heater',
              quantity: 1,
              unitPrice: 750,
              total: 750,
            },
            {
              description: 'Installation Labor',
              quantity: 4,
              unitPrice: 85,
              total: 340,
            },
            {
              description: 'Disposal Fee',
              quantity: 1,
              unitPrice: 85,
              total: 85,
            },
          ],
          notes: 'Old unit was leaking, emergency replacement',
          paymentTerms: 'Net 14',
          tax: { rate: 0.0825, amount: 96.94 },
        },
        {
          id: 'INV-2025-005',
          customer: 'Community Center',
          customerEmail: 'director@communitycenter.org',
          jobId: 'JOB-2025-040',
          jobTitle: 'Roof Repair',
          date: new Date(2025, 4, 6),
          dueDate: new Date(2025, 5, 6),
          amount: 3200.0,
          balance: 0,
          status: 'paid',
          paymentDate: new Date(2025, 5, 1),
          paymentMethod: 'bank_transfer',
          items: [
            {
              description: 'Roofing Materials',
              quantity: 1,
              unitPrice: 1800,
              total: 1800,
            },
            {
              description: 'Labor - 2 Person Team',
              quantity: 16,
              unitPrice: 85,
              total: 1360,
            },
            {
              description: 'Permit Fees',
              quantity: 1,
              unitPrice: 40,
              total: 40,
            },
          ],
          notes: 'Repairs after storm damage',
          paymentTerms: 'Net 30',
          tax: { rate: 0, amount: 0 },
        },
        {
          id: 'INV-2025-006',
          customer: 'Sunrise Senior Living',
          customerEmail: 'facilities@sunrisesenior.com',
          jobId: 'JOB-2025-043',
          jobTitle: 'HVAC Maintenance',
          date: new Date(2025, 4, 7),
          dueDate: new Date(2025, 5, 7),
          amount: 975.0,
          balance: 975.0,
          status: 'unpaid',
          items: [
            {
              description: 'HVAC System Maintenance',
              quantity: 5,
              unitPrice: 175,
              total: 875,
            },
            {
              description: 'Filter Replacement',
              quantity: 5,
              unitPrice: 20,
              total: 100,
            },
          ],
          notes: 'Quarterly maintenance contract',
          paymentTerms: 'Net 30',
          tax: { rate: 0, amount: 0 },
        },
      ];

      setInvoices(sampleInvoices);
      setFilteredInvoices(sampleInvoices);
      setIsLoading(false);
    }, 800);
  }, []);

  // Apply filters
  useEffect(() => {
    if (invoices.length === 0) return;

    let results = [...invoices];

    // Apply status filter
    if (filters.status !== 'all') {
      results = results.filter((invoice) => invoice.status === filters.status);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(filters.dateRange));
      results = results.filter((invoice) => invoice.date >= cutoffDate);
    }

    // Apply amount range filter
    if (filters.minAmount) {
      results = results.filter(
        (invoice) => invoice.amount >= parseFloat(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      results = results.filter(
        (invoice) => invoice.amount <= parseFloat(filters.maxAmount)
      );
    }

    // Apply customer filter
    if (filters.customer !== 'all') {
      results = results.filter(
        (invoice) => invoice.customer === filters.customer
      );
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (invoice) =>
          invoice.id.toLowerCase().includes(term) ||
          invoice.customer.toLowerCase().includes(term) ||
          invoice.jobTitle.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    results.sort((a, b) => {
      if (sortConfig.key === 'amount' || sortConfig.key === 'balance') {
        return sortConfig.direction === 'asc'
          ? a[sortConfig.key] - b[sortConfig.key]
          : b[sortConfig.key] - a[sortConfig.key];
      } else {
        // For dates or strings
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        } else {
          // String comparison
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();

          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      }
    });

    setFilteredInvoices(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [invoices, filters, searchTerm, sortConfig]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique customers for filter dropdown
  const uniqueCustomers = [
    'all',
    ...new Set(invoices.map((inv) => inv.customer)),
  ];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Handle invoice creation (simplified)
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    // Logic to create invoice would go here
    setShowInvoiceForm(false);
  };

  // Create invoice from job (simplified)
  const createInvoiceFromJob = (jobId) => {
    // Logic would go here
    console.log(`Creating invoice from job ${jobId}`);
  };

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <div>
          <Navbar />
        </div>

        <div className='p-6'>
          {/* Header */}
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>Invoices</h1>
              <p className='text-gray-600'>
                Manage customer invoices and payments
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-2 mt-4 md:mt-0'>
              <button
                onClick={() => setShowInvoiceForm(true)}
                className='flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
              >
                <Plus size={16} className='mr-1' />
                New Invoice
              </button>

              <button className='flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50'>
                <Download size={16} className='mr-1' />
                Export
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className='bg-white p-4 shadow rounded-lg mb-6'>
            <div className='flex flex-col md:flex-row justify-between gap-4'>
              <div className='relative md:w-1/3'>
                <input
                  type='text'
                  placeholder='Search invoices...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <Search
                  size={18}
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                />
              </div>

              <div className='flex flex-wrap items-center gap-3'>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className='border rounded-md py-2 px-3 text-gray-700'
                >
                  <option value='all'>All Statuses</option>
                  <option value='paid'>Paid</option>
                  <option value='unpaid'>Unpaid</option>
                  <option value='partial'>Partially Paid</option>
                  <option value='overdue'>Overdue</option>
                </select>

                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters({ ...filters, dateRange: e.target.value })
                  }
                  className='border rounded-md py-2 px-3 text-gray-700'
                >
                  <option value='all'>All Dates</option>
                  <option value='7'>Last 7 Days</option>
                  <option value='30'>Last 30 Days</option>
                  <option value='90'>Last 90 Days</option>
                  <option value='365'>Last Year</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className='flex items-center border rounded-md py-2 px-3 text-gray-700 hover:bg-gray-50'
                >
                  <Filter size={16} className='mr-1' />
                  More Filters
                  {showFilters ? (
                    <ChevronUp size={16} className='ml-1' />
                  ) : (
                    <ChevronDown size={16} className='ml-1' />
                  )}
                </button>

                <button
                  onClick={() => {
                    setFilters({
                      status: 'all',
                      dateRange: '30',
                      minAmount: '',
                      maxAmount: '',
                      customer: 'all',
                    });
                    setSearchTerm('');
                  }}
                  className='text-blue-600 hover:underline flex items-center'
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t'>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Customer
                  </label>
                  <select
                    value={filters.customer}
                    onChange={(e) =>
                      setFilters({ ...filters, customer: e.target.value })
                    }
                    className='w-full border rounded-md py-2 px-3 text-gray-700'
                  >
                    <option value='all'>All Customers</option>
                    {uniqueCustomers
                      .filter((c) => c !== 'all')
                      .map((customer, index) => (
                        <option key={index} value={customer}>
                          {customer}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Min Amount
                  </label>
                  <input
                    type='number'
                    placeholder='$0.00'
                    value={filters.minAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, minAmount: e.target.value })
                    }
                    className='w-full border rounded-md py-2 px-3 text-gray-700'
                  />
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>
                    Max Amount
                  </label>
                  <input
                    type='number'
                    placeholder='$0.00'
                    value={filters.maxAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, maxAmount: e.target.value })
                    }
                    className='w-full border rounded-md py-2 px-3 text-gray-700'
                  />
                </div>
              </div>
            )}
          </div>

          {/* Invoice summary cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <div className='bg-white p-4 shadow rounded-lg flex items-center'>
              <div className='bg-blue-100 p-3 rounded-full mr-4'>
                <FileText size={20} className='text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Total Invoices</p>
                <p className='text-xl font-semibold'>{invoices.length}</p>
              </div>
            </div>

            <div className='bg-white p-4 shadow rounded-lg flex items-center'>
              <div className='bg-green-100 p-3 rounded-full mr-4'>
                <DollarSign size={20} className='text-green-600' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Total Revenue</p>
                <p className='text-xl font-semibold'>
                  {formatCurrency(
                    invoices.reduce((total, inv) => total + inv.amount, 0)
                  )}
                </p>
              </div>
            </div>

            <div className='bg-white p-4 shadow rounded-lg flex items-center'>
              <div className='bg-yellow-100 p-3 rounded-full mr-4'>
                <Clock size={20} className='text-yellow-600' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Outstanding</p>
                <p className='text-xl font-semibold'>
                  {formatCurrency(
                    invoices.reduce((total, inv) => total + inv.balance, 0)
                  )}
                </p>
              </div>
            </div>

            <div className='bg-white p-4 shadow rounded-lg flex items-center'>
              <div className='bg-red-100 p-3 rounded-full mr-4'>
                <AlertCircle size={20} className='text-red-600' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Overdue</p>
                <p className='text-xl font-semibold'>
                  {formatCurrency(
                    invoices
                      .filter((inv) => inv.status === 'overdue')
                      .reduce((total, inv) => total + inv.balance, 0)
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Invoices table */}
          <div className='bg-white shadow rounded-lg overflow-hidden'>
            {isLoading ? (
              <div className='p-8 text-center'>
                <div className='animate-spin rounded-full w-12 h-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <p className='text-gray-500'>Loading invoices...</p>
              </div>
            ) : filteredInvoices.length > 0 ? (
              <>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-gray-50 text-left'>
                        <th
                          className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                          onClick={() => requestSort('id')}
                        >
                          <div className='flex items-center'>
                            Invoice #
                            {sortConfig.key === 'id' &&
                              (sortConfig.direction === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </div>
                        </th>
                        <th
                          className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                          onClick={() => requestSort('customer')}
                        >
                          <div className='flex items-center'>
                            Customer
                            {sortConfig.key === 'customer' &&
                              (sortConfig.direction === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </div>
                        </th>
                        <th
                          className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                          onClick={() => requestSort('date')}
                        >
                          <div className='flex items-center'>
                            Date
                            {sortConfig.key === 'date' &&
                              (sortConfig.direction === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </div>
                        </th>
                        <th
                          className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                          onClick={() => requestSort('dueDate')}
                        >
                          <div className='flex items-center'>
                            Due Date
                            {sortConfig.key === 'dueDate' &&
                              (sortConfig.direction === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </div>
                        </th>
                        <th
                          className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                          onClick={() => requestSort('amount')}
                        >
                          <div className='flex items-center'>
                            Amount
                            {sortConfig.key === 'amount' &&
                              (sortConfig.direction === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </div>
                        </th>
                        <th
                          className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                          onClick={() => requestSort('balance')}
                        >
                          <div className='flex items-center'>
                            Balance
                            {sortConfig.key === 'balance' &&
                              (sortConfig.direction === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </div>
                        </th>
                        <th
                          className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer'
                          onClick={() => requestSort('status')}
                        >
                          <div className='flex items-center'>
                            Status
                            {sortConfig.key === 'status' &&
                              (sortConfig.direction === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </div>
                        </th>
                        <th className='px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                      {currentInvoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className='hover:bg-gray-50 cursor-pointer'
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <td className='px-6 py-4'>
                            <div className='flex items-center'>
                              <FileText
                                size={16}
                                className='text-gray-400 mr-2'
                              />
                              <span className='font-medium text-blue-600'>
                                {invoice.id}
                              </span>
                            </div>
                          </td>
                          <td className='px-6 py-4'>{invoice.customer}</td>
                          <td className='px-6 py-4'>
                            {formatDate(invoice.date)}
                          </td>
                          <td className='px-6 py-4'>
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className='px-6 py-4 font-medium'>
                            {formatCurrency(invoice.amount)}
                          </td>
                          <td className='px-6 py-4 font-medium'>
                            {invoice.balance > 0
                              ? formatCurrency(invoice.balance)
                              : '-'}
                          </td>
                          <td className='px-6 py-4'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                invoice.status
                              )}`}
                            >
                              {invoice.status.charAt(0).toUpperCase() +
                                invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <div
                              className='flex items-center space-x-3'
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button className='text-blue-600 hover:text-blue-800'>
                                <Share size={16} />
                              </button>
                              <button className='text-gray-600 hover:text-gray-800'>
                                <Printer size={16} />
                              </button>
                              <button className='text-gray-600 hover:text-gray-800'>
                                <ExternalLink size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className='px-6 py-4 bg-gray-50 flex items-center justify-between'>
                  <div className='text-sm text-gray-500'>
                    Showing {indexOfFirstItem + 1} to{' '}
                    {Math.min(indexOfLastItem, filteredInvoices.length)} of{' '}
                    {filteredInvoices.length} invoices
                  </div>

                  <div className='flex space-x-1'>
                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    {totalPages > 5 && (
                      <>
                        <span className='px-2 py-1'>...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === totalPages
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className='p-8 text-center'>
                <FileText size={48} className='text-gray-300 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-700'>
                  No invoices found
                </h3>
                <p className='text-gray-500 mt-1'>
                  Try adjusting your filters or search term
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center'>
              <h2 className='text-xl font-bold text-gray-800'>
                Invoice {selectedInvoice.id}
              </h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className='text-gray-500 hover:text-gray-700'
              >
                <X size={24} />
              </button>
            </div>

            <div className='p-6'>
              {/* Invoice Header */}
              <div className='flex flex-col md:flex-row justify-between mb-6'>
                <div>
                  <h3 className='text-lg font-medium text-gray-800'>
                    {selectedInvoice.customer}
                  </h3>
                  <p className='text-gray-600'>
                    {selectedInvoice.customerEmail}
                  </p>
                  <div className='flex items-center mt-2 text-sm text-gray-600'>
                    <span>Job: </span>
                    <span className='ml-1 text-blue-600'>
                      {selectedInvoice.jobId}
                    </span>
                    <span className='mx-1'>-</span>
                    <span>{selectedInvoice.jobTitle}</span>
                  </div>
                </div>

                <div className='mt-4 md:mt-0 text-right'>
                  <div className='flex flex-col'>
                    <span className='text-sm text-gray-600'>Invoice Date</span>
                    <span className='font-medium'>
                      {formatDate(selectedInvoice.date)}
                    </span>
                  </div>
                  <div className='flex flex-col mt-2'>
                    <span className='text-sm text-gray-600'>Due Date</span>
                    <span className='font-medium'>
                      {formatDate(selectedInvoice.dueDate)}
                    </span>
                  </div>
                  <div
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${getStatusColor(
                      selectedInvoice.status
                    )}`}
                  >
                    {selectedInvoice.status.charAt(0).toUpperCase() +
                      selectedInvoice.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className='mb-6'>
                <h4 className='text-lg font-medium text-gray-800 mb-3'>
                  Invoice Items
                </h4>
                <div className='bg-gray-50 rounded-lg overflow-hidden'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b'>
                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Description
                        </th>
                        <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Quantity
                        </th>
                        <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Unit Price
                        </th>
                        <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className='px-4 py-3'>{item.description}</td>
                          <td className='px-4 py-3 text-right'>
                            {item.quantity}
                          </td>
                          <td className='px-4 py-3 text-right'>
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className='px-4 py-3 text-right font-medium'>
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className='border-t'>
                        <td
                          colSpan={3}
                          className='px-4 py-3 text-right font-medium'
                        >
                          Subtotal
                        </td>
                        <td className='px-4 py-3 text-right font-medium'>
                          {formatCurrency(
                            selectedInvoice.items.reduce(
                              (sum, item) => sum + item.total,
                              0
                            )
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className='px-4 py-3 text-right font-medium'
                        >
                          Tax ({(selectedInvoice.tax.rate * 100).toFixed(2)}%)
                        </td>
                        <td className='px-4 py-3 text-right font-medium'>
                          {formatCurrency(selectedInvoice.tax.amount)}
                        </td>
                      </tr>
                      <tr className='bg-gray-100'>
                        <td
                          colSpan={3}
                          className='px-4 py-3 text-right font-bold'
                        >
                          Total
                        </td>
                        <td className='px-4 py-3 text-right font-bold'>
                          {formatCurrency(selectedInvoice.amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div>
                  <h4 className='text-lg font-medium text-gray-800 mb-3'>
                    Payment Terms
                  </h4>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p>{selectedInvoice.paymentTerms}</p>
                    {selectedInvoice.notes && (
                      <div className='mt-3'>
                        <h5 className='text-sm font-medium text-gray-700'>
                          Notes
                        </h5>
                        <p className='text-sm text-gray-600 mt-1'>
                          {selectedInvoice.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className='text-lg font-medium text-gray-800 mb-3'>
                    Payment Status
                  </h4>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    {selectedInvoice.status === 'paid' ? (
                      <>
                        <div className='flex items-center text-green-600'>
                          <CheckCircle size={18} className='mr-2' />
                          <span className='font-medium'>Paid in Full</span>
                        </div>
                        <div className='mt-2 text-sm text-gray-600'>
                          <p>
                            Payment Date:{' '}
                            {formatDate(selectedInvoice.paymentDate)}
                          </p>
                          <p className='mt-1'>
                            Method:{' '}
                            {selectedInvoice.paymentMethod
                              .replace('_', ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                        </div>
                      </>
                    ) : selectedInvoice.status === 'partial' ? (
                      <>
                        <div className='flex items-center text-blue-600'>
                          <Clock size={18} className='mr-2' />
                          <span className='font-medium'>Partially Paid</span>
                        </div>
                        <div className='mt-2 text-sm'>
                          <p>
                            Paid:{' '}
                            {formatCurrency(selectedInvoice.paymentAmount)}
                          </p>
                          <p className='mt-1'>
                            Remaining: {formatCurrency(selectedInvoice.balance)}
                          </p>
                          <p className='mt-1'>
                            Payment Date:{' '}
                            {formatDate(selectedInvoice.paymentDate)}
                          </p>
                          <p className='mt-1'>
                            Method:{' '}
                            {selectedInvoice.paymentMethod
                              .replace('_', ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                        </div>
                      </>
                    ) : selectedInvoice.status === 'overdue' ? (
                      <>
                        <div className='flex items-center text-red-600'>
                          <AlertCircle size={18} className='mr-2' />
                          <span className='font-medium'>Overdue</span>
                        </div>
                        <div className='mt-2 text-sm'>
                          <p>
                            Amount Due:{' '}
                            {formatCurrency(selectedInvoice.balance)}
                          </p>
                          <p className='mt-1'>
                            Days Overdue:{' '}
                            {Math.floor(
                              (new Date() - selectedInvoice.dueDate) /
                                (1000 * 60 * 60 * 24)
                            )}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='flex items-center text-yellow-600'>
                          <Clock size={18} className='mr-2' />
                          <span className='font-medium'>Unpaid</span>
                        </div>
                        <div className='mt-2 text-sm'>
                          <p>
                            Amount Due:{' '}
                            {formatCurrency(selectedInvoice.balance)}
                          </p>
                          <p className='mt-1'>
                            Due In:{' '}
                            {Math.floor(
                              (selectedInvoice.dueDate - new Date()) /
                                (1000 * 60 * 60 * 24)
                            )}{' '}
                            days
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className='flex flex-wrap justify-end gap-3 pt-4 border-t'>
                <button className='flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'>
                  <Printer size={16} className='mr-2' />
                  Print
                </button>
                <button className='flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'>
                  <Share size={16} className='mr-2' />
                  Send
                </button>
                <button className='flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'>
                  <Edit size={16} className='mr-2' />
                  Edit
                </button>
                {selectedInvoice.status !== 'paid' && (
                  <button className='flex items-center px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700'>
                    <DollarSign size={16} className='mr-2' />
                    Record Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Form Modal */}
      {showInvoiceForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center'>
              <h2 className='text-xl font-bold text-gray-800'>
                Create New Invoice
              </h2>
              <button
                onClick={() => setShowInvoiceForm(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className='p-6'>
              {/* Customer Information */}
              <div className='mb-6'>
                <h3 className='text-lg font-medium text-gray-800 mb-3'>
                  Customer Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Customer Name
                    </label>
                    <select className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'>
                      <option value=''>Select a customer...</option>
                      {uniqueCustomers
                        .filter((c) => c !== 'all')
                        .map((customer, index) => (
                          <option key={index} value={customer}>
                            {customer}
                          </option>
                        ))}
                      <option value='new'>+ Add New Customer</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Email
                    </label>
                    <input
                      type='email'
                      className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='customer@example.com'
                    />
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className='mb-6'>
                <h3 className='text-lg font-medium text-gray-800 mb-3'>
                  Job Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Related Job
                    </label>
                    <select className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'>
                      <option value=''>Select a job...</option>
                      <option value='JOB-2025-027'>
                        JOB-2025-027 - HVAC Installation
                      </option>
                      <option value='JOB-2025-029'>
                        JOB-2025-029 - Plumbing Repair
                      </option>
                      <option value='JOB-2025-031'>
                        JOB-2025-031 - Electrical Inspection
                      </option>
                      <option value='none'>No related job</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Invoice Title
                    </label>
                    <input
                      type='text'
                      className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='e.g. HVAC Installation'
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className='mb-6'>
                <h3 className='text-lg font-medium text-gray-800 mb-3'>
                  Invoice Details
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Invoice Date
                    </label>
                    <input
                      type='date'
                      className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Due Date
                    </label>
                    <input
                      type='date'
                      className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Payment Terms
                    </label>
                    <select className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'>
                      <option value='due_on_receipt'>Due on Receipt</option>
                      <option value='net_7'>Net 7</option>
                      <option value='net_14'>Net 14</option>
                      <option value='net_30' selected>
                        Net 30
                      </option>
                      <option value='net_60'>Net 60</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className='mb-6'>
                <div className='flex justify-between items-center mb-3'>
                  <h3 className='text-lg font-medium text-gray-800'>
                    Line Items
                  </h3>
                  <button
                    type='button'
                    className='text-blue-600 hover:text-blue-800 flex items-center'
                  >
                    <Plus size={16} className='mr-1' />
                    Add Item
                  </button>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-gray-700'>
                    <div className='col-span-5'>Description</div>
                    <div className='col-span-2'>Quantity</div>
                    <div className='col-span-2'>Unit Price</div>
                    <div className='col-span-2'>Total</div>
                    <div className='col-span-1'></div>
                  </div>

                  {/* Sample line item */}
                  <div className='grid grid-cols-12 gap-2 mb-3'>
                    <div className='col-span-5'>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='Item description'
                      />
                    </div>
                    <div className='col-span-2'>
                      <input
                        type='number'
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='1'
                        min='1'
                      />
                    </div>
                    <div className='col-span-2'>
                      <input
                        type='number'
                        className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        placeholder='0.00'
                        step='0.01'
                        min='0'
                      />
                    </div>
                    <div className='col-span-2'>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100'
                        placeholder='0.00'
                        readOnly
                      />
                    </div>
                    <div className='col-span-1 flex items-center justify-center'>
                      <button
                        type='button'
                        className='text-red-600 hover:text-red-800'
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Totals section */}
                  <div className='border-t pt-4 mt-6'>
                    <div className='flex justify-between mb-2'>
                      <span className='text-gray-700'>Subtotal</span>
                      <span className='font-medium'>$0.00</span>
                    </div>
                    <div className='flex justify-between items-center mb-2'>
                      <div className='flex items-center'>
                        <span className='text-gray-700 mr-2'>Tax</span>
                        <input
                          type='number'
                          className='w-16 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='0'
                          step='0.01'
                          min='0'
                        />
                        <span className='ml-1'>%</span>
                      </div>
                      <span className='font-medium'>$0.00</span>
                    </div>
                    <div className='flex justify-between mt-3 pt-3 border-t'>
                      <span className='font-bold text-gray-800'>Total</span>
                      <span className='font-bold text-gray-800'>$0.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Notes
                </label>
                <textarea
                  className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24'
                  placeholder='Add any notes or payment instructions...'
                ></textarea>
              </div>

              {/* Form buttons */}
              <div className='flex justify-end gap-3 pt-4 border-t'>
                <button
                  type='button'
                  onClick={() => setShowInvoiceForm(false)}
                  className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700'
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
