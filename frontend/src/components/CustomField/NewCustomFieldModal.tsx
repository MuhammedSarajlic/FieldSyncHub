import { useState } from 'react';
import icons from '../../constants/icons';
import ButtonIcon from '../CustomElements/ButtonIcon';
import CustomButton from '../CustomElements/CustomButton';
import CustomFieldForm from './CustomFieldForm';
import { TAddCustomField, TCustomField } from '../../types/CustomField';
import { CustomFieldType } from '../../constants/Enumeration/CustomFieldEnum/CustomFieldEnum';
import { CreateCustomField } from '../../services/CustomField';

interface INewCustomFieldModal {
  setIsCreateCustomFieldModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  workspaceId: string;
  setCustomFields: React.Dispatch<React.SetStateAction<TCustomField[]>>;
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
}: INewCustomFieldModal) => {
  const [customField, setCustomField] = useState<TAddCustomField>(
    customFieldInitialValue
  );

  const addCustomField = async () => {
    const trimmedOptions = (customField.dropdownOptions || []).filter(
      (opt) => opt.trim() !== ''
    );

    const updatedCustomField: TAddCustomField = {
      ...customField,
      dropdownOptions: trimmedOptions,
      workspaceId,
    };

    console.log(updatedCustomField);
    const response = await CreateCustomField(updatedCustomField);
    if (response.status === 200) {
      console.log(response);
      setCustomFields((prev) => [...prev, response.data]);
      setCustomField(customFieldInitialValue);
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
