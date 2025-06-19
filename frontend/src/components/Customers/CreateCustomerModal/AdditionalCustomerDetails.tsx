import { useEffect, useState } from 'react';
import NewCustomFieldModal from '../../CustomField/NewCustomFieldModal';
import CustomSmallButton from '../../CustomElements/CustomSmallButton';
import { TAddCustomer } from '../../../types/Customer';
import ModalInputField from '../../CustomElements/ModalInputField';
import { TCustomField } from '../../../types/CustomField';
import { GetCustomFieldsByWorkspace } from '../../../services/CustomField';
import { useAuth } from '../../../context/AuthProvider';
import { CustomFieldType } from '../../../constants/Enumeration/CustomFieldEnum/CustomFieldEnum';

interface IAdditionalCustomerDetails {
  customer: TAddCustomer;
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
}

const AdditionalCustomerDetails = ({
  customer,
  setCustomer,
}: IAdditionalCustomerDetails) => {
  const { user } = useAuth();
  const [isCreateCustomFieldModalOpen, setIsCreateCustomFieldModalOpen] =
    useState<boolean>(false);
  const [customFields, setCustomFields] = useState<TCustomField[]>([]);

  const fetchCustomFields = async () => {
    if (!user?.workspace) return;
    const response = await GetCustomFieldsByWorkspace(user?.workspace?.id);
    if (response.status === 200) setCustomFields(response.data.payload);
  };

  useEffect(() => {
    fetchCustomFields();
  }, []);
  return (
    <>
      <div className='space-y-2'>
        <div className='py-1 px-2 flex items-center justify-between bg-[#FAFAFA] rounded-md'>
          <p className='font-medium text-lg'>Additional customer details</p>
        </div>
        <div className='px-2 pt-2 space-y-3'>
          {customFields.map((field) => (
            <div
              key={field.id}
              className='w-full flex items-center justify-between'
            >
              <p className='w-1/2 text-primary text-sm'>{field.fieldName}</p>

              {field.fieldType === CustomFieldType.Checkbox ? (
                <div className='w-full flex items-center justify-start'>
                  <input
                    type='checkbox'
                    checked={field.defaultValue === 'true'}
                    readOnly
                    className='w-5 h-5 accent-[#356852]'
                  />
                </div>
              ) : field.fieldType === CustomFieldType.Dropdown ? (
                <select
                  className='text-sm w-full border border-border-primary rounded-lg px-3 py-2 text-heading outline-none focus:border-[#356852]'
                  value={field.defaultValue}
                  disabled
                >
                  {field.defaultValue && <option>{field.defaultValue}</option>}
                  {field.dropdownOptions
                    ?.filter((option) => option !== field.defaultValue)
                    .map((option, idx) => (
                      <option key={idx}>{option}</option>
                    ))}
                </select>
              ) : (
                <ModalInputField
                  inputType={CustomFieldType[field.fieldType]}
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
          workspaceId={user?.workspace?.id}
          setCustomFields={setCustomFields}
        />
      )}
    </>
  );
};

export default AdditionalCustomerDetails;
