import { useState } from 'react';
import NewCustomFieldModal from '../../CustomField/NewCustomFieldModal';
import CustomSmallButton from '../../CustomElements/CustomSmallButton';

const AdditionalCustomerDetails = () => {
  const [isCreateCustomFieldModalOpen, setIsCreateCustomFieldModalOpen] =
    useState<boolean>(false);
  return (
    <>
      <div className='space-y-2'>
        <div className='px-2 py-1 flex items-center justify-between cursor-pointer bg-[#FAFAFA] rounded-md'>
          <p className='font-medium text-lg'>Additional customer details</p>
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
        />
      )}
    </>
  );
};

export default AdditionalCustomerDetails;
