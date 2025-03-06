import { useState } from 'react';
import icons from '../../../constants/icons';
import NewCustomFieldModal from '../../CustomField/NewCustomFieldModal';

const AdditionalCustomerDetails = () => {
  const [isAdditionalDetailsOpen, setIsAdditionalDetailsOpen] =
    useState<boolean>(false);
  const [isCreateCustomFieldModalOpen, setIsCreateCustomFieldModalOpen] =
    useState<boolean>(false);
  return (
    <>
      <div className='space-y-2'>
        <div
          onClick={() => setIsAdditionalDetailsOpen(!isAdditionalDetailsOpen)}
          className='px-2 py-1 flex items-center justify-between cursor-pointer hover:bg-[#FAFAFA]'
        >
          <p className='font-medium text-lg'>Additional customer details</p>
          <img
            src={icons.arrowDownIcon}
            alt='arrow down'
            className={`h-3.5 w-3.5 transition-all duration-300 ${
              isAdditionalDetailsOpen ? 'rotate-180' : null
            }`}
          />
        </div>
        <div
          className={`mt-2 px-2 overflow-hidden transition-all duration-300 ease-in-out ${
            isAdditionalDetailsOpen ? 'opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <button
            onClick={() => setIsCreateCustomFieldModalOpen(true)}
            className={`flex items-center space-x-1.5 border-[1px] border-border-primary rounded-lg py-1.5 px-2.5 cursor-pointer hover:bg-[#FAFAFA] hover:border-primary transition-colors duration-200`}
          >
            <p className={`text-sm font-semibold text-text-secondary `}>
              Add Custom Field
            </p>
          </button>
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
