import { useEffect, useState } from 'react';
import {
  Plus,
  MapPin,
  DollarSign,
  MessageSquare,
  CheckCircle,
  Briefcase,
  UserCheck,
  Clipboard,
  FileText,
  Clock,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import CustomIconButton from '../components/CustomElements/CustomIconButton';
import IconButton from '../components/CustomElements/Buttons/IconButton';
import { Link } from 'react-router';

// Mock data types for demonstration
interface TJob {
  id: string;
  title: string;
  customerName: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Pending';
  technician: string;
  time: string;
  location: string;
}

interface TTechnician {
  id: string;
  name: string;
  status: 'Available' | 'On Job' | 'Offline';
  currentJob: string | null;
  location: string;
}

interface TInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  dueDate: string;
}

interface TCustomerMessage {
  id: string;
  customerName: string;
  messageSnippet: string;
  unread: boolean;
}

interface TPendingApproval {
  id: string;
  quoteNumber: string;
  customerName: string;
  status: 'Pending' | 'Approved' | 'Declined';
}

const Home = () => {
  const [todaysJobs, setTodaysJobs] = useState<TJob[]>([]);
  const [technicians, setTechnicians] = useState<TTechnician[]>([]);
  const [outstandingInvoices, setOutstandingInvoices] = useState<TInvoice[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<TCustomerMessage[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<TPendingApproval[]>(
    []
  );

  // Mock data fetching
  useEffect(() => {
    // Simulate API calls
    const fetchMockData = () => {
      setTodaysJobs([
        {
          id: 'job-1',
          title: 'HVAC Repair',
          customerName: 'Alice Johnson',
          status: 'In Progress',
          technician: 'John Doe',
          time: '10:00 AM',
          location: '123 Main St',
        },
        {
          id: 'job-2',
          title: 'Plumbing Inspection',
          customerName: 'Bob Williams',
          status: 'Scheduled',
          technician: 'Jane Smith',
          time: '02:00 PM',
          location: '456 Oak Ave',
        },
        {
          id: 'job-3',
          title: 'Electrical Wiring',
          customerName: 'Charlie Brown',
          status: 'Pending',
          technician: 'Unassigned',
          time: '09:00 AM',
          location: '789 Pine Ln',
        },
        {
          id: 'job-4',
          title: 'Roof Repair',
          customerName: 'Diana Prince',
          status: 'Completed',
          technician: 'Clark Kent',
          time: '01:00 PM',
          location: '101 Cedar Rd',
        },
      ]);

      setTechnicians([
        {
          id: 'tech-1',
          name: 'John Doe',
          status: 'On Job',
          currentJob: 'HVAC Repair (job-1)',
          location: '123 Main St',
        },
        {
          id: 'tech-2',
          name: 'Jane Smith',
          status: 'Available',
          currentJob: null,
          location: 'Office',
        },
        {
          id: 'tech-3',
          name: 'Clark Kent',
          status: 'Offline',
          currentJob: null,
          location: 'Home',
        },
      ]);

      setOutstandingInvoices([
        {
          id: 'inv-1',
          invoiceNumber: 'INV-001',
          customerName: 'Alice Johnson',
          amount: 550.0,
          dueDate: '2025-07-20',
        },
        {
          id: 'inv-2',
          invoiceNumber: 'INV-002',
          customerName: 'Bob Williams',
          amount: 1200.0,
          dueDate: '2025-07-25',
        },
      ]);

      setUnreadMessages([
        {
          id: 'msg-1',
          customerName: 'Alice Johnson',
          messageSnippet: 'Regarding the HVAC repair, can you...',
          unread: true,
        },
        {
          id: 'msg-2',
          customerName: 'Charlie Brown',
          messageSnippet: 'Is the quote for the wiring still valid?',
          unread: true,
        },
      ]);

      setPendingApprovals([
        {
          id: 'app-1',
          quoteNumber: 'QTE-005',
          customerName: 'Eve Adams',
          status: 'Pending',
        },
        {
          id: 'app-2',
          quoteNumber: 'QTE-006',
          customerName: 'Frank Green',
          status: 'Pending',
        },
      ]);
    };

    fetchMockData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-purple-100 text-purple-800';
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'On Job':
        return 'bg-blue-100 text-blue-800';
      case 'Offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 ml-[260px]'>
        <Navbar />
        <div className='p-6'>
          <h1 className='text-3xl font-bold text-gray-800 mb-6'>
            FieldSyncHub Command Center
          </h1>

          {/* Quick Action Buttons */}
          <motion.div
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'
            initial='hidden'
            animate='visible'
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <motion.div variants={cardVariants}>
              <IconButton
                icon={<Plus className='w-5 h-5 mr-2' />}
                customStyle='w-full py-3 px-4 bg-bg-primary text-white hover:bg-bg-primary-hover shadow-md rounded-xl'
                onClick={() => console.log('Create Job/Lead')}
              >
                Create Job / Lead
              </IconButton>
            </motion.div>
            <motion.div variants={cardVariants}>
              <IconButton
                icon={<CheckCircle className='w-5 h-5 mr-2' />}
                customStyle='w-full py-3 px-4 bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-md rounded-xl'
                onClick={() => console.log('Mark Job Started')}
              >
                Mark Job Started
              </IconButton>
            </motion.div>
            <motion.div variants={cardVariants}>
              <IconButton
                icon={<Clipboard className='w-5 h-5 mr-2' />}
                customStyle='w-full py-3 px-4 bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-md rounded-xl'
                onClick={() => console.log('Quick Create Quote')}
              >
                Quick Create Quote
              </IconButton>
            </motion.div>
            <motion.div variants={cardVariants}>
              <IconButton
                icon={<FileText className='w-5 h-5 mr-2' />}
                customStyle='w-full py-3 px-4 bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-md rounded-xl'
                onClick={() => console.log('Quick Create Invoice')}
              >
                Quick Create Invoice
              </IconButton>
            </motion.div>
          </motion.div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Left Column */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Today's Jobs & Visits */}
              <motion.div
                className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'
                initial='hidden'
                animate='visible'
                variants={cardVariants}
              >
                <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                  <Calendar className='w-5 h-5 mr-2 text-bg-primary' /> Today's
                  Jobs & Visits
                </h2>
                {todaysJobs.length > 0 ? (
                  <div className='space-y-4'>
                    {todaysJobs.map((job) => (
                      <div
                        key={job.id}
                        className='flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200'
                      >
                        <div>
                          <h3 className='font-medium text-gray-900'>
                            {job.title}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {job.customerName} - {job.time}
                          </p>
                          <p className='text-xs text-gray-500 flex items-center mt-1'>
                            <MapPin className='w-3 h-3 mr-1' /> {job.location}
                          </p>
                        </div>
                        <div className='flex items-center gap-3'>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              job.status
                            )}`}
                          >
                            {job.status}
                          </span>
                          <span className='text-sm text-gray-700'>
                            {job.technician}
                          </span>
                          <Link to={`/jobs/${job.id}`}>
                            <ChevronRight className='w-5 h-5 text-gray-400 hover:text-gray-600' />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-500'>No jobs scheduled for today.</p>
                )}
              </motion.div>

              {/* Technician Status Tracking */}
              <motion.div
                className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'
                initial='hidden'
                animate='visible'
                variants={cardVariants}
              >
                <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                  <UserCheck className='w-5 h-5 mr-2 text-bg-primary' />{' '}
                  Technician Status
                </h2>
                {technicians.length > 0 ? (
                  <div className='space-y-4'>
                    {technicians.map((tech) => (
                      <div
                        key={tech.id}
                        className='flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100'
                      >
                        <div>
                          <h3 className='font-medium text-gray-900'>
                            {tech.name}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {tech.currentJob ? tech.currentJob : 'Idle'}
                          </p>
                          <p className='text-xs text-gray-500 flex items-center mt-1'>
                            <MapPin className='w-3 h-3 mr-1' /> {tech.location}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            tech.status
                          )}`}
                        >
                          {tech.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-500'>No technicians available.</p>
                )}
              </motion.div>
            </div>

            {/* Right Column */}
            <div className='lg:col-span-1 space-y-6'>
              {/* Light Financial Snapshot */}
              <motion.div
                className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'
                initial='hidden'
                animate='visible'
                variants={cardVariants}
              >
                <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                  <DollarSign className='w-5 h-5 mr-2 text-bg-primary' />{' '}
                  Financial Snapshot
                </h2>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-gray-700 font-medium'>
                      Outstanding Invoices:
                    </p>
                    <span className='text-lg font-bold text-red-600'>
                      ${outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                    </span>
                  </div>
                  <p className='text-sm text-gray-500'>
                    ({outstandingInvoices.length} invoices awaiting payment)
                  </p>
                  <Link
                    to='/invoices'
                    className='text-bg-primary hover:underline text-sm flex items-center'
                  >
                    View All Invoices <ChevronRight className='w-4 h-4 ml-1' />
                  </Link>
                </div>
              </motion.div>

              {/* Customer Communications */}
              <motion.div
                className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'
                initial='hidden'
                animate='visible'
                variants={cardVariants}
              >
                <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                  <MessageSquare className='w-5 h-5 mr-2 text-bg-primary' />{' '}
                  Customer Communications
                </h2>
                <div className='space-y-4'>
                  {unreadMessages.length > 0 ? (
                    unreadMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100'
                      >
                        <div>
                          <p className='font-medium text-gray-900'>
                            {msg.customerName}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {msg.messageSnippet}
                          </p>
                        </div>
                        {msg.unread && (
                          <span className='px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800'>
                            New
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className='text-gray-500'>No unread messages.</p>
                  )}
                  <Link
                    to='/messages'
                    className='text-bg-primary hover:underline text-sm flex items-center'
                  >
                    View All Messages{' '}
                    <ChevronRight className='w-4 h-4 ml-1' />
                  </Link>
                </div>
              </motion.div>

              {/* Pending Approvals */}
              <motion.div
                className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'
                initial='hidden'
                animate='visible'
                variants={cardVariants}
              >
                <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                  <Clock className='w-5 h-5 mr-2 text-bg-primary' /> Pending
                  Approvals
                </h2>
                <div className='space-y-4'>
                  {pendingApprovals.length > 0 ? (
                    pendingApprovals.map((approval) => (
                      <div
                        key={approval.id}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100'
                      >
                        <div>
                          <p className='font-medium text-gray-900'>
                            Quote #{approval.quoteNumber}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {approval.customerName}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                            approval.status
                          )}`}
                        >
                          {approval.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className='text-gray-500'>No pending approvals.</p>
                  )}
                  <Link
                    to='/quotes?status=pending'
                    className='text-bg-primary hover:underline text-sm flex items-center'
                  >
                    View All Quotes{' '}
                    <ChevronRight className='w-4 h-4 ml-1' />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
