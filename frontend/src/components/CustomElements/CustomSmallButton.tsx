import Button, { ButtonVariant } from './Button';

interface ICustomSmallButton {
  title: string;
  variant?: ButtonVariant;
  customStyle?: string;
  customTextStyle?: string;
  handleClick?: () => void;
}

const CustomSmallButton = ({
  title,
  variant = 'secondary',
  customStyle,
  customTextStyle,
  handleClick,
}: ICustomSmallButton) => {
  return (
    <Button variant={variant} onClick={handleClick} customStyle={customStyle}>
      <span className={`font-semibold text-text-secondary ${customTextStyle}`}>
        {title}
      </span>
    </Button>
  );
};

export default CustomSmallButton;
