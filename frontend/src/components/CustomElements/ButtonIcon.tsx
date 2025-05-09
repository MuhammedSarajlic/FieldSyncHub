interface IButtonIcon {
  name?: string;
  icon?: string;
  customStyle?: string;
  customTextStyle?: string;
  customImageStyle?: string;
  handleBtnClick?: () => void;
}

const ButtonIcon = ({
  name,
  icon,
  customStyle,
  customTextStyle,
  customImageStyle,
  handleBtnClick,
}: IButtonIcon) => {
  return (
    <button
      onClick={handleBtnClick}
      className={`flex items-center space-x-1.5 border-[1px] border-border-primary rounded-lg py-2 px-4 cursor-pointer hover:bg-[#FAFAFA] hover:border-primary transition-colors duration-200 ${customStyle}`}
    >
      {icon && (
        <img src={icon} alt={name} className={`w-4 h-4 ${customImageStyle}`} />
      )}
      <p className={`text-sm font-semibold text-heading ${customTextStyle}`}>
        {name}
      </p>
    </button>
  );
};

export default ButtonIcon;
