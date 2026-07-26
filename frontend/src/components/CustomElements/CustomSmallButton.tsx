import Button from './Button';

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
    <Button variant='secondary' onClick={handleClick} customStyle={customStyle}>
      <span className={`font-semibold text-text-secondary ${customTextStyle}`}>
        {title}
      </span>
    </Button>
  );
};

export default CustomSmallButton;
