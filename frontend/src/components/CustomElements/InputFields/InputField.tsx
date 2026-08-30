import FormField from '../FormField';

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
  return (
    <FormField
      label={labelText}
      id={inputName}
      name={inputName}
      type={inputType || 'text'}
      placeholder={inputPlaceholder}
      value={inputValue}
      onChange={handleChange}
      className={customStyle}
      fullWidth={isFullWidth}
    />
  );
};

export default InputField;
