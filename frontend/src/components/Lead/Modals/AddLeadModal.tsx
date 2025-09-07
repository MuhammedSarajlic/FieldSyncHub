import { X } from 'lucide-react';
import CustomButton from '../../CustomElements/Buttons/CustomButton';
import InputField from '../../CustomElements/InputFields/InputField';
import { useState } from 'react';
import { TAddLead } from '../../../types/Lead';
import { LeadPriority } from '../../../constants/Enumeration/LeadEnum/LeadEnum';

interface IAddLeadModal {
  isOpen: boolean;
  onClose: () => void;
}

const AddLeadModal = ({ isOpen, onClose }: IAddLeadModal) => {
  const [lead, setLead] = useState<TAddLead>({
    firstName: '',
    lastName: '',
    companyName: '',
    phoneNumber: '',
    email: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    workspaceId: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    priority: LeadPriority.Normal,
    lineItems: [],
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLead((prevLead) => ({ ...prevLead, [name]: value }));
  };

  const handleSubmit = () => {
    console.log(lead);
  };

  if (!isOpen) return null;

  return (
    <div className='absolute w-full h-screen bg-black/30 flex items-center justify-center'>
      <div className='bg-white w-3xl rounded-lg space-y-6 overflow-hidden'>
        {/* Header */}
        <div className='bg-white flex justify-between items-center px-8 py-4 border-b border-gray-100'>
          <div>
            <h2 className='text-2xl font-bold text-text-primary'>
              Create Lead
            </h2>
          </div>
          <button
            onClick={onClose}
            className='w-10 h-10 rounded-full cursor-pointer hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600'
            aria-label='Close modal'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='px-8'>
          <div>
            <p className='font-semibold'>Contact Info</p>
            <div className='mt-4 space-y-3'>
              <div className='w-full space-x-3 flex items-center'>
                <InputField
                  labelText='First Name'
                  inputName='firstName'
                  inputType='text'
                  inputPlaceholder='First name'
                  inputValue={lead.firstName}
                  handleChange={handleChange}
                  isFullWidth={false}
                />
                <InputField
                  labelText='Last Name'
                  inputName='lastName'
                  inputType='text'
                  inputPlaceholder='Last name'
                  inputValue={lead.lastName}
                  handleChange={handleChange}
                  isFullWidth={false}
                />
              </div>
              <InputField
                labelText='Company Name'
                inputName='companyName'
                inputType='text'
                inputPlaceholder='Company Name'
                inputValue={lead.companyName}
                handleChange={handleChange}
                isFullWidth={true}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 bg-white z-10 px-8 py-4 border-t border-gray-100'>
          <div className='flex items-center justify-end space-x-3'>
            <CustomButton
              onClick={onClose}
              customStyle='px-5 py-2.5 shadow-sm border-gray-300 hover:bg-gray-50'
            >
              Cancel
            </CustomButton>
            <CustomButton
              onClick={handleSubmit}
              customStyle='px-5 py-2.5 bg-bg-primary text-white hover:bg-bg-primary-hover'
            >
              Create Lead
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;
