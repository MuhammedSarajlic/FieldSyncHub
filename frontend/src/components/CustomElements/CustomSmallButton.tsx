interface ICustomSmallButton {
  title: string;
  customStyle?: string;
  customTextStyle?: string;
  handleClick?: () => void;
}

const CustomSmallButton = ({
  title,
  customStyle,
  customTextStyle,
  handleClick,
}: ICustomSmallButton) => {
  return (
    <button
      onClick={handleClick}
      className={`border-[1px] border-border-primary rounded-lg py-1.5 px-2.5 cursor-pointer hover:bg-[#FAFAFA] hover:border-primary transition-colors duration-200 ${customStyle}`}
    >
      <p
        className={`text-sm font-semibold text-text-secondary ${customTextStyle}`}
      >
        {title}
      </p>
    </button>
  );
};

export default CustomSmallButton;
