import { useState } from 'react';
import ModalInputField from '../CustomElements/ModalInputField';

const CustomFieldForm = () => {
  const [fieldType, setFieldType] = useState<string>('text');
  const [dropdownOptions, setDropdownOptions] = useState<string[]>(['']);
  const [defaultValue, setDefaultValue] = useState<string>('');
  const [dropdownDefaultValue, setDropdownDefaultValue] = useState('');

  const handleAddFieldOption = () => {
    setDropdownOptions([...dropdownOptions, '']);
  };

  const renderDefaultValueInput = () => {
    switch (fieldType) {
      case 'text':
        return (
          <ModalInputField
            inputType='text'
            placeholder='Default value'
            label='Default Value'
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
          />
        );
      case 'numeric':
        return (
          <ModalInputField
            inputType='number'
            placeholder='Default value'
            label='Default Value'
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
          />
        );
      case 'boolean':
        return (
          <div className='flex flex-col space-y-1'>
            <label className='text-sm text-primary font-medium'>
              Default Value
            </label>
            <select
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              className='w-full p-2 text-sm text-heading outline-none border-[1px] border-border-primary rounded-lg'
            >
              <option value='true'>Yes</option>
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
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
          />
        );
      case 'dropdown':
        return (
          <div className='flex flex-col space-y-2'>
            <div className='space-y-2'>
              <p className='text-sm text-primary font-medium'>
                Options for dropdown
              </p>
              {dropdownOptions.map((option, index) => (
                <div key={index} className='space-y-2'>
                  {index === 0 && (
                    <div className='flex-1'>
                      <ModalInputField
                        placeholder='Default option'
                        inputType='text'
                        value={dropdownDefaultValue}
                        onChange={(e) =>
                          setDropdownDefaultValue(e.target.value)
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
                          const newOptions = [...dropdownOptions];
                          newOptions[index] = e.target.value;
                          setDropdownOptions(newOptions);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddFieldOption}
                className={`flex items-center space-x-1.5 border-[1px] border-border-primary rounded-lg py-1.5 px-2.5 cursor-pointer hover:bg-[#FAFAFA] hover:border-primary transition-colors duration-200`}
              >
                <p className={`text-sm font-semibold text-text-secondary `}>
                  Add Another Option
                </p>
              </button>
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
            setFieldType(e.target.value);
            setDefaultValue('');
            setDropdownDefaultValue('');
            setDropdownOptions(['']);
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
