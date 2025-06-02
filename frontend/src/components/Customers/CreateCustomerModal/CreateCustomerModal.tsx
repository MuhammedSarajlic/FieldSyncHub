import ButtonIcon from '../../CustomElements/ButtonIcon';
import CustomButton from '../../CustomElements/CustomButton';
import icons from '../../../constants/icons';
import CreateCustomerForm from './CreateCustomerForm';
import { TAddCustomer } from '../../../types/Customer';
import { addCustomerInitialState } from '../../../const/states';
import { useState } from 'react';
import { CreateCustomer } from '../../../services/Customer';
import { useAuth } from '../../../context/AuthProvider';

interface ICreateCustomerModal {
  setIsAddCustomerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getAllCustomersByWorkspace: () => Promise<void>;
}

const CreateCustomerModal = ({
  setIsAddCustomerModalOpen,
  getAllCustomersByWorkspace,
}: ICreateCustomerModal) => {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<TAddCustomer>(
    addCustomerInitialState
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateCustomer = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!customer.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!customer.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (customer.isCompany && !customer.companyName?.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCustomer = async () => {
    if (!user) return;

    const isValid = validateCustomer();
    if (!isValid) return;

    const updatedCustomer = {
      ...customer,
      workspaceId: user.workspace?.id,
    };

    const response = await CreateCustomer(updatedCustomer);
    if (response.status === 200) {
      getAllCustomersByWorkspace();
      setIsAddCustomerModalOpen(false);
      setCustomer(addCustomerInitialState);
      setErrors({});
    }
  };

  return (
    <div className='fixed top-0 left-0 w-full h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center'>
      <div className='py-6 bg-white rounded-lg w-2/3 h-[95vh] flex flex-col'>
        <div className='px-6 pb-4 h-14 flex items-center justify-between'>
          <p className='text-2xl font-bold text-heading'>New Customer</p>
          <div
            onClick={() => {
              setIsAddCustomerModalOpen(false);
              setCustomer(addCustomerInitialState);
            }}
            className='p-3 cursor-pointer bg-[#ececec] rounded-md hover:bg-[#dddddd] transition-colors duration-200'
          >
            <img src={icons.closeIcon} alt='close' className='w-3.5 h-3.5' />
          </div>
        </div>

        <div className='flex-grow overflow-y-auto'>
          <CreateCustomerForm
            customer={customer}
            setCustomer={setCustomer}
            errors={errors}
          />
        </div>

        <div className='px-6 pt-4 h-14 flex items-center justify-end space-x-3'>
          <ButtonIcon
            name='Cancel'
            handleBtnClick={() => {
              setIsAddCustomerModalOpen(false);
              setCustomer(addCustomerInitialState);
            }}
          />
          <CustomButton
            title='Save Customer'
            handleBtnClick={handleCreateCustomer}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
