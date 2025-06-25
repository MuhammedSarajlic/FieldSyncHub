interface ICustomButton {
  title: string;
  customStyle?: string;
  handleBtnClick?: () => void;
  isDisabled?: boolean;
}

const CustomButton = ({
  title,
  customStyle,
  handleBtnClick,
  isDisabled,
}: ICustomButton) => {
  return (
    <button
      disabled={isDisabled}
      onClick={handleBtnClick}
      className={`rounded-lg py-2 px-6 text-white text-sm transition-colors duration-200 ${customStyle} ${
        isDisabled
          ? 'cursor-auto bg-bg-primary/90'
          : 'cursor-pointer bg-bg-primary hover:bg-bg-primary-hover'
      }`}
    >
      {title}
    </button>
  );
};

export default CustomButton;
