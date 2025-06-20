interface ICustomButton {
  title: string;
  customStyle?: string;
  handleBtnClick?: () => void;
}

const CustomButton = ({
  title,
  customStyle,
  handleBtnClick,
}: ICustomButton) => {
  return (
    <button
      onClick={handleBtnClick}
      className={`bg-bg-primary rounded-md py-2 px-6 text-white text-sm cursor-pointer hover:bg-bg-primary-hover transition-colors duration-200 ${customStyle}`}
    >
      {title}
    </button>
  );
};

export default CustomButton;
