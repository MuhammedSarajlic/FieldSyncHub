import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Trash2,
  User,
  FileText,
} from 'lucide-react';
import { DateTime } from 'luxon';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import Button from '../components/CustomElements/Button';
import ActionConfirmationModal from '../components/Quotes/QuotesModals/ActionConfirmationModal';
import PageLoader from '../components/CustomElements/Loaders/PageLoader';
import { TLead } from '../types/Lead';
import { DeleteLead, GetLeadById, UpdateLead } from '../services/Lead';
import { getLeadStatus } from '../utils/FuntionHelpers/getLeadStatus';
import { getJobPriority } from '../utils/FuntionHelpers/JobUtils/getJobPriority';
import {
  LeadPriority,
  LeadStatus,
} from '../constants/Enumeration/LeadEnum/LeadEnum';

const statusLabel = (value: LeadStatus) => LeadStatus[value];
const priorityLabel = (value: LeadPriority) => LeadPriority[value];

const LeadDetails = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<TLead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const fetchLead = async () => {
    if (!leadId) return;
    setIsLoading(true);
    const response = await GetLeadById(leadId);
    if (response.status === 200) {
      const payload = response.data.payload as TLead;
      setLead(payload);
      setNotes(payload.notes ?? '');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const handleStatusChange = async (status: LeadStatus) => {
    if (!lead) return;
    const response = await UpdateLead({ id: lead.id, status });
    if (response.status === 200) {
      setLead({ ...lead, status });
    }
  };

  const handlePriorityChange = async (priority: LeadPriority) => {
    if (!lead) return;
    const response = await UpdateLead({ id: lead.id, priority });
    if (response.status === 200) {
      setLead({ ...lead, priority });
    }
  };

  const handleSaveNotes = async () => {
    if (!lead) return;
    setIsSavingNotes(true);
    const response = await UpdateLead({ id: lead.id, notes });
    if (response.status === 200) {
      setLead({ ...lead, notes });
    }
    setIsSavingNotes(false);
  };

  const handleDelete = async () => {
    if (!lead) return;
    await DeleteLead(lead.id);
    navigate('/leads');
  };

  if (isLoading) {
    return (
      <div className='flex h-screen'>
        <Sidebar />
        <div className='flex-1 ml-64'>
          <Navbar />
          <PageLoader />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className='flex h-screen'>
        <Sidebar />
        <div className='flex-1 ml-64'>
          <Navbar />
          <div className='px-6 pt-6'>
            <p className='text-gray-600'>Lead not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getLeadStatus(lead.status);
  const priorityColor = getJobPriority(Number(lead.priority));
  const customer = lead.customer;

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 ml-64 overflow-y-auto'>
        <Navbar customer={customer} />
        <div className='px-6 pt-6 pb-10'>
          {/* Header */}
          <div className='flex items-start justify-between mb-6'>
            <div>
              <button
                onClick={() => navigate('/leads')}
                className='inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2 cursor-pointer'
              >
                <ArrowLeft className='w-4 h-4 mr-1' />
                Back to Leads
              </button>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold text-heading'>
                  {customer?.fullName ?? 'Unknown customer'}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                >
                  {statusConfig.icon}
                  <span className='capitalize'>
                    {statusLabel(lead.status)}
                  </span>
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${priorityColor}`}
                >
                  {priorityLabel(lead.priority)}
                </span>
              </div>
              <p className='text-sm text-gray-500 mt-1'>
                Created {DateTime.fromISO(lead.createdAt).toFormat('DDD')}
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <select
                value={lead.status}
                onChange={(e) =>
                  handleStatusChange(Number(e.target.value) as LeadStatus)
                }
                className='border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-bg-primary focus:border-bg-primary cursor-pointer'
              >
                {Object.values(LeadStatus)
                  .filter((v) => typeof v === 'number')
                  .map((value) => (
                    <option key={value} value={value}>
                      {LeadStatus[value as number]}
                    </option>
                  ))}
              </select>
              <select
                value={lead.priority}
                onChange={(e) =>
                  handlePriorityChange(Number(e.target.value) as LeadPriority)
                }
                className='border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-bg-primary focus:border-bg-primary cursor-pointer'
              >
                {Object.values(LeadPriority)
                  .filter((v) => typeof v === 'number')
                  .map((value) => (
                    <option key={value} value={value}>
                      {LeadPriority[value as number]}
                    </option>
                  ))}
              </select>
              <Button
                variant='danger'
                onClick={() => setIsDeleteModalOpen(true)}
                leftIcon={<Trash2 className='w-4 h-4' />}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Left column */}
            <div className='lg:col-span-2 space-y-6'>
              <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3'>
                  <FileText className='w-5 h-5 text-gray-600' />
                  Description
                </h3>
                <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                  {lead.description || 'No description provided.'}
                </p>
              </div>

              <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Notes
                  </h3>
                  <Button
                    variant='secondary'
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || notes === (lead.notes ?? '')}
                  >
                    {isSavingNotes ? 'Saving...' : 'Save'}
                  </Button>
                </div>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder='Add internal notes about this lead...'
                  className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bg-primary focus:border-bg-primary resize-none'
                />
              </div>
            </div>

            {/* Right column */}
            <div className='space-y-6'>
              <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4'>
                  <User className='w-5 h-5 text-gray-600' />
                  Customer
                </h3>
                {customer ? (
                  <div className='space-y-3 text-sm'>
                    <p className='font-medium text-gray-900'>
                      {customer.fullName}
                    </p>
                    {customer.emails?.[0] && (
                      <p className='flex items-center gap-2 text-gray-600'>
                        <Mail className='w-4 h-4 text-gray-400' />
                        {customer.emails[0]}
                      </p>
                    )}
                    {customer.customerPhones?.[0] && (
                      <p className='flex items-center gap-2 text-gray-600'>
                        <Phone className='w-4 h-4 text-gray-400' />
                        {customer.customerPhones[0].phoneNumber}
                      </p>
                    )}
                    {customer.properties?.[0] && (
                      <p className='flex items-start gap-2 text-gray-600'>
                        <MapPin className='w-4 h-4 text-gray-400 mt-0.5' />
                        {customer.properties[0].street},{' '}
                        {customer.properties[0].city}{' '}
                        {customer.properties[0].postalCode}
                      </p>
                    )}
                    <button
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className='text-sm font-medium text-bg-primary hover:text-bg-primary-hover cursor-pointer'
                    >
                      View customer profile
                    </button>
                  </div>
                ) : (
                  <p className='text-sm text-gray-500'>No customer linked.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActionConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={customer?.fullName ?? 'this lead'}
        actionType='delete'
        itemType='lead'
      />
    </div>
  );
};

export default LeadDetails;
