import { useState } from 'react';
import icons from '../../constants/icons';
import { TAddCustomer } from '../../types/Customer';
import ButtonIcon from '../CustomElements/ButtonIcon';
import CustomButton from '../CustomElements/CustomButton';
import CustomFieldForm from './CustomFieldForm';
import { TAddCustomField } from '../../types/CustomField';

interface INewCustomFieldModal {
  setIsCreateCustomFieldModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  customer: TAddCustomer;
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
}

const customFieldInitialValue = {
  fieldName: '',
  fieldType: 'text',
  defaultValue: '',
  dropdownOptions: [''],
};

const NewCustomFieldModal = ({
  setIsCreateCustomFieldModalOpen,
  customer,
  setCustomer,
}: INewCustomFieldModal) => {
  const [customField, setCustomField] = useState<TAddCustomField>(
    customFieldInitialValue
  );

  const addCustomField = () => {
    setCustomer({
      ...customer,
      customFields: [...customer.customFields, customField],
    });
  };

  return (
    <div className='fixed top-0 left-0 w-full h-screen bg-black/50 flex items-center justify-center'>
      <div className='py-6 bg-white rounded-lg w-1/3 flex flex-col'>
        <div className='px-6 pb-4 h-14 flex items-center justify-between'>
          <p className='text-2xl font-bold text-heading'>New Custom Field</p>
          <div
            onClick={() => setIsCreateCustomFieldModalOpen(false)}
            className='p-3 cursor-pointer bg-[#ececec] rounded-md hover:bg-[#dddddd] transition-colors duration-200'
          >
            <img src={icons.closeIcon} alt='close' className='w-3.5 h-3.5' />
          </div>
        </div>

        <div className='flex-grow overflow-y-auto'>
          <CustomFieldForm
            customField={customField}
            setCustomField={setCustomField}
          />
        </div>

        <div className='px-6 pt-4 h-14 flex items-center justify-end space-x-3'>
          <ButtonIcon
            name='Cancel'
            handleBtnClick={() => {
              setCustomField(customFieldInitialValue);
              setIsCreateCustomFieldModalOpen(false);
            }}
          />
          <CustomButton
            title='Create Custom Field'
            handleBtnClick={() => {
              addCustomField();
              setIsCreateCustomFieldModalOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NewCustomFieldModal;
