import ModalInputField from '../CustomElements/ModalInputField';
import CustomSmallButton from '../CustomElements/CustomSmallButton';
import { TAddCustomField } from '../../types/CustomField';

interface ICustomFieldForm {
  customField: TAddCustomField;
  setCustomField: React.Dispatch<React.SetStateAction<TAddCustomField>>;
}

const CustomFieldForm = ({ customField, setCustomField }: ICustomFieldForm) => {
  const handleAddFieldOption = () => {
    setCustomField({
      ...customField,
      dropdownOptions: [...(customField.dropdownOptions || []), ''],
    });
  };

  const renderDefaultValueInput = () => {
    switch (customField.fieldType) {
      case 'text':
        return (
          <ModalInputField
            inputType='text'
            placeholder='Default value'
            label='Default Value'
            value={customField.defaultValue}
            onChange={(e) =>
              setCustomField({ ...customField, defaultValue: e.target.value })
            }
          />
        );
      case 'numeric':
        return (
          <ModalInputField
            inputType='number'
            placeholder='Default value'
            label='Default Value'
            value={customField.defaultValue}
            onChange={(e) =>
              setCustomField({ ...customField, defaultValue: e.target.value })
            }
          />
        );
      case 'boolean':
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
              className='w-full p-2 text-sm text-heading outline-none border-[1px] border-border-primary rounded-lg'
            >
              <option defaultValue='true' value='true'>
                Yes
              </option>
              <option value='false'>No</option>
            </select>
          </div>
        );
      case 'date':
        return (
          <ModalInputField
            inputType='date'
            placeholder='Default value'
            label='Default Value'
            value={customField.defaultValue}
            onChange={(e) =>
              setCustomField({ ...customField, defaultValue: e.target.value })
            }
          />
        );
      case 'dropdown':
        return (
          <div className='flex flex-col space-y-2'>
            <div className='space-y-2'>
              <p className='text-sm text-primary font-medium'>
                Options for dropdown
              </p>
              {customField.dropdownOptions?.map((option, index) => (
                <div key={index} className='space-y-2'>
                  {index === 0 && (
                    <div className='flex-1'>
                      <ModalInputField
                        placeholder='Default option'
                        inputType='text'
                        value={customField.defaultValue}
                        onChange={(e) =>
                          setCustomField({
                            ...customField,
                            defaultValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                  <div className='flex items-center space-x-2'>
                    <p className='text-sm'>{index + 1}.</p>
                    <div className='flex-1'>
                      <ModalInputField
                        inputType='text'
                        value={option}
                        placeholder='Option'
                        onChange={(e) => {
                          const newOptions = [
                            ...(customField.dropdownOptions || []),
                          ];
                          newOptions[index] = e.target.value;
                          setCustomField({
                            ...customField,
                            dropdownOptions: newOptions,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <CustomSmallButton
                title='Add Another Option'
                handleClick={handleAddFieldOption}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='px-6 space-y-2'>
      <ModalInputField
        inputType='text'
        label='Custom Field Name'
        placeholder='Custom field name'
        value={customField.fieldName}
        onChange={(e) =>
          setCustomField({ ...customField, fieldName: e.target.value })
        }
      />
      <div className='flex flex-col space-y-1'>
        <label
          htmlFor='custom_field_type'
          className='text-sm text-primary font-medium'
        >
          Field Type
        </label>
        <select
          name='custom_field_type'
          id='custom_field_type'
          onChange={(e) => {
            setCustomField({
              ...customField,
              fieldType: e.target.value,
              defaultValue: e.target.value === 'boolean' ? 'true' : '',
              dropdownOptions: [''],
            });
          }}
          className='w-full p-2 text-sm text-heading outline-none border-[1px] border-border-primary rounded-lg'
        >
          <option value='text'>Text</option>
          <option value='numeric'>Numeric</option>
          <option value='boolean'>True/False</option>
          <option value='date'>Date</option>
          <option value='dropdown'>Dropdown</option>
        </select>
      </div>
      {renderDefaultValueInput()}
    </div>
  );
};

export default CustomFieldForm;
