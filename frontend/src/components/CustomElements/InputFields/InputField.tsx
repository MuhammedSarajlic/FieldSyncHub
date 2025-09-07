interface IInputField {
  labelText?: string;
  inputName?: string;
  inputType?: string;
  inputPlaceholder?: string;
  inputValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customStyle?: string;
  isFullWidth?: boolean;
}

const InputField = ({
  labelText,
  inputName,
  inputType,
  inputPlaceholder,
  inputValue,
  handleChange,
  customStyle,
  isFullWidth = true,
}: IInputField) => {
  const inputStyle =
    'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring- focus:ring-[#356852] focus:border-[#356852]';

  return (
    <div className={`${isFullWidth ? 'w-full' : 'w-1/2'} flex flex-col`}>
      {labelText && (
        <label
          htmlFor={inputName}
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          {labelText}
        </label>
      )}
      <input
        id={inputName}
        name={inputName}
        type={inputType || 'text'}
        placeholder={inputPlaceholder || ''}
        value={inputValue}
        onChange={handleChange}
        className={`${inputStyle} ${customStyle}`}
      />
    </div>
  );
};

export default InputField;
