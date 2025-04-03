import { useState } from 'react';
import NewCustomFieldModal from '../../CustomField/NewCustomFieldModal';
import CustomSmallButton from '../../CustomElements/CustomSmallButton';
import { TAddCustomer } from '../../../types/Customer';
import ModalInputField from '../../CustomElements/ModalInputField';

interface IAdditionalCustomerDetails {
  customer: TAddCustomer;
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
}

const AdditionalCustomerDetails = ({
  customer,
  setCustomer,
}: IAdditionalCustomerDetails) => {
  const [isCreateCustomFieldModalOpen, setIsCreateCustomFieldModalOpen] =
    useState<boolean>(false);
  return (
    <>
      <div className='space-y-2'>
        <div className='py-1 flex items-center justify-between bg-[#FAFAFA] rounded-md'>
          <p className='font-medium text-lg'>Additional customer details</p>
        </div>
        <div className='px-2 space-y-2'>
          {customer.customFields.map((field) => (
            <div className='w-full flex items-center justify-between'>
              <p className='w-1/2 text-primary text-sm'>{field.fieldName}</p>
              {field.fieldType === 'boolean' ? (
                <ModalInputField
                  inputType='checkbox'
                  isChecked={field.defaultValue === 'true'}
                />
              ) : field.fieldType === 'dropdown' ? (
                <select>
                  {field.defaultValue !== '' && (
                    <option>{field.defaultValue}</option>
                  )}
                  {field.dropdownOptions?.map((option) => (
                    <option>{option}</option>
                  ))}
                </select>
              ) : (
                <ModalInputField
                  inputType={field.fieldType}
                  value={field.defaultValue}
                />
              )}
            </div>
          ))}
        </div>
        <div
          className={`mt-4 px-2 overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <CustomSmallButton
            title='Add Custom Field'
            handleClick={() => setIsCreateCustomFieldModalOpen(true)}
          />
        </div>
      </div>
      {isCreateCustomFieldModalOpen && (
        <NewCustomFieldModal
          setIsCreateCustomFieldModalOpen={setIsCreateCustomFieldModalOpen}
          customer={customer}
          setCustomer={setCustomer}
        />
      )}
    </>
  );
};

export default AdditionalCustomerDetails;
