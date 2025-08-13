const CustomCheckbox = ({ setChecked, checked, checkboxSize }) => {
  return (
    <label className='flex items-center cursor-pointer'>
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className='sr-only'
      />
      <div
        className={`${checkboxSize} rounded border-2 flex items-center justify-center ${
          checked
            ? 'bg-bg-primary border-bg-primary'
            : 'bg-white border-gray-300 hover:border-bg-primary'
        }`}
      >
        {checked && (
          <svg
            className='w-4 h-4 text-white'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
        )}
      </div>
    </label>
  );
};

export default CustomCheckbox;
