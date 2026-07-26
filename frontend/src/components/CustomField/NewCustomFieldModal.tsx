import { useState } from 'react';
import { X } from 'lucide-react';
import ButtonIcon from '../CustomElements/ButtonIcon';
import CustomButton from '../CustomElements/CustomButton';
import CustomFieldForm from './CustomFieldForm';
import { TAddCustomField, TCustomField } from '../../types/CustomField';
import { CustomFieldType } from '../../constants/Enumeration/CustomFieldEnum/CustomFieldEnum';
import { CreateCustomField } from '../../services/CustomField';
import { TAddCustomer } from '../../types/Customer';

interface INewCustomFieldModal {
  setIsCreateCustomFieldModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  workspaceId: string;
  setCustomFields: React.Dispatch<React.SetStateAction<TCustomField[]>>;
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
}

const customFieldInitialValue = {
  workspaceId: '',
  fieldName: '',
  fieldType: CustomFieldType.Text,
  defaultValue: '',
  dropdownOptions: [],
  isRequired: true,
};

const NewCustomFieldModal = ({
  setIsCreateCustomFieldModalOpen,
  workspaceId,
  setCustomFields,
  setCustomer,
}: INewCustomFieldModal) => {
  const [customField, setCustomField] = useState<TAddCustomField>(
    customFieldInitialValue
  );
  const [error, setError] = useState<boolean>(false);

  const addCustomField = async () => {
    if (!customField.fieldName.trim()) {
      setError(true);
      return;
    }

    const trimmedOptions = (customField.dropdownOptions || []).filter(
      (opt) => opt.trim() !== ''
    );

    const updatedCustomField: TAddCustomField = {
      ...customField,
      dropdownOptions: trimmedOptions,
      workspaceId,
    };

    const response = await CreateCustomField(updatedCustomField);

    if (response.status === 200) {
      const newField = response.data as TCustomField;

      // Add to UI
      setCustomFields((prev) => [...prev, newField]);

      // Add to customer.customFieldValues if has default value
      if (
        newField.defaultValue !== undefined &&
        newField.defaultValue !== null &&
        newField.defaultValue !== ''
      ) {
        setCustomer((prev) => {
          const existing = prev.customFieldValues ?? [];
          return {
            ...prev,
            customFieldValues: [
              ...existing,
              { customFieldId: newField.id, value: newField.defaultValue! },
            ],
          };
        });
      }

      setCustomField(customFieldInitialValue);
      setIsCreateCustomFieldModalOpen(false);
    }
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
            <X className='w-3.5 h-3.5' />
          </div>
        </div>

        <div className='flex-grow overflow-y-auto'>
          <CustomFieldForm
            customField={customField}
            setCustomField={setCustomField}
            error={error}
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
            handleBtnClick={addCustomField}
          />
        </div>
      </div>
    </div>
  );
};

export default NewCustomFieldModal;
