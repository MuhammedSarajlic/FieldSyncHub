interface IModalInputField {
  label?: string;
  inputType: string;
  placeholder?: string;
  customStyle?: string;
  isChecked?: boolean;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  error?: string;
}

const ModalInputField = ({
  label,
  inputType,
  placeholder,
  customStyle,
  isChecked,
  value,
  onChange,
  error,
}: IModalInputField) => {
  return (
    <div className='w-full flex flex-col space-y-1'>
      {label && (
        <label htmlFor={label} className='text-sm text-primary font-medium'>
          {label}
        </label>
      )}
      <input
        id={label}
        type={inputType}
        placeholder={placeholder}
        value={value}
        checked={isChecked}
        onChange={onChange}
        className={`w-full px-3 py-2 text-sm text-heading outline-none border-[1px] ${
          error ? 'border-red-600' : 'border-border-primary'
        } rounded-lg ${customStyle}`}
      />
      {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
    </div>
  );
};

export default ModalInputField;
