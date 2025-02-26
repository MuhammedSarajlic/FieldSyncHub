import Select, { StylesConfig } from 'react-select';
import countryList from 'country-list';
import { useState } from 'react';

interface CountryOption {
  value: string;
  label: string;
}

const CountryDropdown = () => {
  const [selectedCountry, setSelectedCountry] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const options = countryList.getNames().map((country) => ({
    value: country,
    label: country,
  }));

  const customStyles: StylesConfig<CountryOption, false> = {
    control: (provided, state) => ({
      ...provided,
      width: '100%',
      fontSize: '0.875rem',
      border: '1px solid #e3e3e3',
      borderColor: state.isFocused ? '#356852' : '#D1D5DB',
      borderRadius: '0.5rem',
      outline: 'none',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(53, 104, 82)' : 'none',
      backgroundColor: 'white',
      '&:hover': {
        borderColor: '#e3e3e3',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white',
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '0.875rem',
      backgroundColor: state.isSelected ? '#356852' : 'white',
      color: state.isSelected ? 'white' : 'black',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      '&:hover': {
        backgroundColor: '#E5E7EB',
        color: 'black',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9CA3AF',
      fontSize: '0.875rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: '0.875rem',
      color: '#374151',
    }),
  };

  return (
    <div className='w-full'>
      <label className='block text-sm font-medium text-gray-700'>Country</label>
      <Select
        options={options}
        value={selectedCountry}
        onChange={(newValue) =>
          setSelectedCountry(newValue as { value: string; label: string })
        }
        placeholder='Choose a country'
        styles={customStyles}
        className='mt-1'
      />
    </div>
  );
};

export default CountryDropdown;
