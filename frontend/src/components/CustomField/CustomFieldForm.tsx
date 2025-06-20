import ModalInputField from '../CustomElements/ModalInputField';
import CustomSmallButton from '../CustomElements/CustomSmallButton';
import { TAddCustomField } from '../../types/CustomField';
import { CustomFieldType } from '../../constants/Enumeration/CustomFieldEnum/CustomFieldEnum';

interface ICustomFieldForm {
  customField: TAddCustomField;
  setCustomField: React.Dispatch<React.SetStateAction<TAddCustomField>>;
  error: boolean;
}

const CustomFieldForm = ({
  customField,
  setCustomField,
  error,
}: ICustomFieldForm) => {
  const handleAddOption = () => {
    setCustomField({
      ...customField,
      dropdownOptions: [...(customField.dropdownOptions || []), ''],
    });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const updated = [...(customField.dropdownOptions || [])];
    updated[index] = value;
    setCustomField({ ...customField, dropdownOptions: updated });
  };

  const renderDefaultInput = () => {
    if (
      customField.fieldType === CustomFieldType.Text ||
      customField.fieldType === CustomFieldType.Number ||
      customField.fieldType === CustomFieldType.Date
    ) {
      return (
        <ModalInputField
          inputType={
            customField.fieldType === CustomFieldType.Number
              ? 'number'
              : customField.fieldType === CustomFieldType.Date
              ? 'date'
              : 'text'
          }
          label='Default Value'
          placeholder='Default value'
          value={customField.defaultValue}
          onChange={(e) =>
            setCustomField({ ...customField, defaultValue: e.target.value })
          }
        />
      );
    }

    if (customField.fieldType === CustomFieldType.Checkbox) {
      return (
        <div className='flex flex-col space-y-1'>
          <label className='text-sm text-primary font-medium'>
            Default Value
          </label>
          <select
            value={customField.defaultValue}
            onChange={(e) =>
              setCustomField({ ...customField, defaultValue: e.target.value })
            }
            className='w-full p-2 text-sm text-heading outline-none border border-border-primary rounded-lg'
          >
            <option value='true'>Yes</option>
            <option value='false'>No</option>
          </select>
        </div>
      );
    }

    if (customField.fieldType === CustomFieldType.Dropdown) {
      return (
        <>
          <ModalInputField
            inputType='text'
            label='Default Option'
            placeholder='Default dropdown value'
            value={customField.defaultValue}
            onChange={(e) =>
              setCustomField({ ...customField, defaultValue: e.target.value })
            }
          />
          <div className='flex flex-col space-y-1'>
            {(customField.dropdownOptions || []).map((option, index) => (
              <div key={index} className='flex items-center space-x-2'>
                <p className='text-sm w-5'>{index + 1}.</p>
                <ModalInputField
                  inputType='text'
                  placeholder='Option'
                  value={option}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className='pt-2'>
            <CustomSmallButton
              title='Add Option'
              handleClick={handleAddOption}
            />
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className='px-6 space-y-3'>
      <ModalInputField
        inputType='text'
        label='Custom Field Name'
        placeholder='Custom field name'
        value={customField.fieldName}
        onChange={(e) =>
          setCustomField({ ...customField, fieldName: e.target.value })
        }
        error={error ? 'Field name is required' : ''}
      />

      <div className='flex flex-col space-y-1'>
        <label htmlFor='fieldType' className='text-sm text-primary font-medium'>
          Field Type
        </label>
        <select
          id='fieldType'
          value={customField.fieldType}
          onChange={(e) => {
            const newType = parseInt(e.target.value) as CustomFieldType;

            let defaultValue = '';
            let dropdownOptions: string[] = [];

            if (newType === CustomFieldType.Checkbox) {
              defaultValue = 'true';
            } else if (newType === CustomFieldType.Dropdown) {
              dropdownOptions = [''];
            }

            setCustomField({
              ...customField,
              fieldType: newType,
              defaultValue,
              dropdownOptions,
            });
          }}
          className='w-full p-2 text-sm text-heading outline-none border border-border-primary rounded-lg'
        >
          <option value={CustomFieldType.Text}>Text</option>
          <option value={CustomFieldType.Number}>Numeric</option>
          <option value={CustomFieldType.Checkbox}>True/False</option>
          <option value={CustomFieldType.Date}>Date</option>
          <option value={CustomFieldType.Dropdown}>Dropdown</option>
        </select>
      </div>

      <div className='flex items-center space-x-2 pt-2'>
        <input
          type='checkbox'
          id='isRequired'
          checked={customField.isRequired}
          onChange={(e) =>
            setCustomField({ ...customField, isRequired: e.target.checked })
          }
        />
        <label htmlFor='isRequired' className='text-sm text-primary'>
          Required Field
        </label>
      </div>

      {renderDefaultInput()}
    </div>
  );
};

export default CustomFieldForm;
