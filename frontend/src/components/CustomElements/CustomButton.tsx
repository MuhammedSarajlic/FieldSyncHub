import Button, { ButtonVariant } from './Button';

interface ICustomButton {
  title: string;
  variant?: ButtonVariant;
  customStyle?: string;
  handleBtnClick?: () => void;
  isDisabled?: boolean;
}

const CustomButton = ({
  title,
  variant = 'primary',
  customStyle,
  handleBtnClick,
  isDisabled,
}: ICustomButton) => {
  return (
    <Button
      variant={variant}
      onClick={handleBtnClick}
      disabled={isDisabled}
      customStyle={customStyle}
    >
      {title}
    </Button>
  );
};

export default CustomButton;
