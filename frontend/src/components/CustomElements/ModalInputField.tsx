interface IModalInputField {
  label?: string;
  inputType: string;
  placeholder?: string;
  customStyle?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

const ModalInputField = ({
  label,
  inputType,
  placeholder,
  customStyle,
  value,
  onChange,
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
        onChange={onChange}
        className={`w-full px-3 py-2 text-sm text-heading outline-none border-[1px] border-border-primary rounded-lg ${customStyle}`}
      />
    </div>
  );
};

export default ModalInputField;
