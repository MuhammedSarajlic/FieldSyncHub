interface ICustomButton {
  title: string;
  customStyle?: string;
}

const CustomButton = ({ title, customStyle }: ICustomButton) => {
  return (
    <button
      className={`bg-bg-primary rounded-lg py-2.5 px-4 text-white text-sm cursor-pointer hover:bg-bg-primary-hover transition-colors duration-200 ${customStyle}`}
    >
      {title}
    </button>
  );
};

export default CustomButton;
