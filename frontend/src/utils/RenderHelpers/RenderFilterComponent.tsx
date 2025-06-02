import { TFilterOption } from '../../types/FilterOption';

export const renderFilterComponent = ({
  option,
  filters,
  handleFilterChange,
  handleRangeChange,
}: {
  option: TFilterOption;
  filters: { [key: string]: any };
  handleFilterChange: (filterName: string, value: string) => void;
  handleRangeChange: (filterName: string, key: string, value: number) => void;
}) => {
  switch (option.type) {
    case 'dropdown':
      return (
        <div key={option.name}>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            {option.label}
          </label>
          <select
            value={filters[option.name]}
            onChange={(e) => handleFilterChange(option.name, e.target.value)}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>Select an option</option>
            {option.dropdownOptions &&
              option.dropdownOptions.map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() +
                    opt.slice(1).replace(/-/g, ' ')}
                </option>
              ))}
          </select>
        </div>
      );

    case 'range':
      return (
        <div key={option.name}>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {option.label}
          </label>
          <div className='flex space-x-2 items-center'>
            <input
              type={option.valueType}
              value={filters[option.name]?.min || ''}
              onChange={(e) =>
                handleRangeChange(
                  option.name,
                  'min',
                  option.valueType === 'number'
                    ? parseFloat(e.target.value)
                    : e.target.value
                )
              }
              placeholder={option.min}
              className='w-full border border-gray-300 shadow-sm rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
            />
            {option.valueType === 'date' && (
              <span className='text-gray-500'>to</span>
            )}
            <input
              type={option.valueType}
              value={filters[option.name]?.max || ''}
              onChange={(e) =>
                handleRangeChange(
                  option.name,
                  'max',
                  option.valueType === 'number'
                    ? parseFloat(e.target.value)
                    : e.target.value
                )
              }
              placeholder={option.max}
              className='w-full border border-gray-300 shadow-sm rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>
      );

    case 'button-select':
      return (
        <div key={option.name}>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {option.label}
          </label>
          <div className='flex space-x-2'>
            {option.options?.map((btnOption: string) => (
              <button
                key={btnOption}
                onClick={() => handleFilterChange(option.name, btnOption)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer
                ${
                  filters[option.name] === btnOption
                    ? 'bg-bg-primary text-white border-bg-primary'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {btnOption.charAt(0).toUpperCase() + btnOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      );

    case 'input':
      return (
        <div key={option.name}>
          <label
            htmlFor={option.name}
            className='block text-sm font-medium text-gray-700'
          >
            {option.label}
          </label>
          <input
            type='text'
            id={option.name}
            value={filters[option.name]}
            onChange={(e) => handleFilterChange(option.name, e.target.value)}
            placeholder={option.placeholder || ''}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          />
        </div>
      );

    default:
      return null;
  }
};
