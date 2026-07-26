import { X, ChevronDown } from 'lucide-react';
import CustomButton from '../../CustomElements/Buttons/CustomButton';
import { useEffect, useState } from 'react';
import { TAddLead } from '../../../types/Lead';
import { LeadPriority } from '../../../constants/Enumeration/LeadEnum/LeadEnum';
import { useAuth } from '../../../context/AuthProvider';
import { GetCustomerByWorkspace } from '../../../services/Customer';
import { CreateLead } from '../../../services/Lead';
import { TCustomer } from '../../../types/Customer';

interface IAddLeadModal {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const leadInitialState = {
  customerId: '',
  description: '',
  priority: LeadPriority.Normal,
  notes: '',
};

const AddLeadModal = ({ isOpen, onClose, onCreated }: IAddLeadModal) => {
  const { user } = useAuth();
  const [lead, setLead] = useState(leadInitialState);
  const [customers, setCustomers] = useState<TCustomer[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = async () => {
    if (!user?.workspace) return;
    const response = await GetCustomerByWorkspace(user.workspace.id, 1, 1000);
    if (response.status === 200) {
      setCustomers(response.data.payload.items);
    }
  };

  useEffect(() => {
    if (isOpen) fetchCustomers();
  }, [isOpen]);

  const handleClose = () => {
    setLead(leadInitialState);
    setErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!lead.customerId) newErrors.customerId = 'Customer is required';
    if (!lead.description.trim())
      newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user?.workspace || !validate()) return;

    const payload: TAddLead = {
      customerId: lead.customerId,
      workspaceId: user.workspace.id,
      description: lead.description.trim(),
      priority: lead.priority,
      notes: lead.notes.trim() || undefined,
      lineItems: [],
    };

    setIsSubmitting(true);
    const response = await CreateLead(payload);
    setIsSubmitting(false);

    if (response.status === 200) {
      onCreated?.();
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 w-full h-screen bg-black/30 flex items-center justify-center z-50'>
      <div className='bg-white w-full max-w-xl rounded-lg overflow-hidden'>
        {/* Header */}
        <div className='bg-white flex justify-between items-center px-8 py-4 border-b border-gray-100'>
          <h2 className='text-2xl font-bold text-text-primary'>Create Lead</h2>
          <button
            onClick={handleClose}
            className='w-10 h-10 rounded-full cursor-pointer hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600'
            aria-label='Close modal'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='px-8 py-6 space-y-5'>
          <div>
            <label
              htmlFor='lead-customer'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Customer <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <select
                id='lead-customer'
                value={lead.customerId}
                onChange={(e) =>
                  setLead({ ...lead, customerId: e.target.value })
                }
                className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-bg-primary focus:border-bg-primary text-sm appearance-none'
              >
                <option value=''>Select a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName}
                  </option>
                ))}
              </select>
              <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                <ChevronDown className='w-5 h-5' />
              </div>
            </div>
            {errors.customerId && (
              <p className='text-red-500 text-sm mt-1'>{errors.customerId}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='lead-description'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Description <span className='text-red-500'>*</span>
            </label>
            <textarea
              id='lead-description'
              rows={3}
              placeholder='What is this lead about?'
              value={lead.description}
              onChange={(e) =>
                setLead({ ...lead, description: e.target.value })
              }
              className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bg-primary focus:border-bg-primary resize-none'
            />
            {errors.description && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='lead-priority'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Priority
            </label>
            <div className='relative'>
              <select
                id='lead-priority'
                value={lead.priority}
                onChange={(e) =>
                  setLead({ ...lead, priority: Number(e.target.value) })
                }
                className='w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-bg-primary focus:border-bg-primary text-sm appearance-none'
              >
                <option value={LeadPriority.Low}>Low</option>
                <option value={LeadPriority.Normal}>Normal</option>
                <option value={LeadPriority.High}>High</option>
                <option value={LeadPriority.Urgent}>Urgent</option>
              </select>
              <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                <ChevronDown className='w-5 h-5' />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor='lead-notes'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Notes
            </label>
            <textarea
              id='lead-notes'
              rows={2}
              placeholder='Optional internal notes'
              value={lead.notes}
              onChange={(e) => setLead({ ...lead, notes: e.target.value })}
              className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bg-primary focus:border-bg-primary resize-none'
            />
          </div>
        </div>

        {/* Footer */}
        <div className='bg-white px-8 py-4 border-t border-gray-100'>
          <div className='flex items-center justify-end space-x-3'>
            <CustomButton onClick={handleClose} customStyle='shadow-sm'>
              Cancel
            </CustomButton>
            <CustomButton
              onClick={handleSubmit}
              variant='primary'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;
