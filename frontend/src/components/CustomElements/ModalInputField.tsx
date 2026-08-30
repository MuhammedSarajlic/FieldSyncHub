import FormField from './FormField';

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
  return <FormField label={label} type={inputType} placeholder={placeholder} value={value} checked={isChecked} onChange={onChange} error={error} className={customStyle} />;
};

export default ModalInputField;
