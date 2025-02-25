interface IModalInputField {
  inputType: string;
  placeholder?: string;
  customStyle?: string;
}

const ModalInputField = ({
  inputType,
  placeholder,
  customStyle,
}: IModalInputField) => {
  return (
    <input
      type={inputType}
      placeholder={placeholder}
      className={`w-full px-4 h-12 text-sm text-heading outline-none ${customStyle}`}
    />
  );
};

export default ModalInputField;
