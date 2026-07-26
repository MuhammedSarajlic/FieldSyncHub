import { ReactNode } from 'react';
import Button, { ButtonVariant } from './Button';

interface IButtonIcon {
  name?: string;
  icon?: string;
  customIcon?: ReactNode;
  variant?: ButtonVariant;
  customStyle?: string;
  customTextStyle?: string;
  customImageStyle?: string;
  handleBtnClick?: () => void;
  buttonType?: 'submit' | 'reset' | 'button';
}

const ButtonIcon = ({
  name,
  icon,
  customIcon,
  variant = 'secondary',
  customStyle,
  customTextStyle,
  customImageStyle,
  handleBtnClick,
  buttonType,
}: IButtonIcon) => {
  return (
    <Button
      type={buttonType}
      variant={variant}
      onClick={handleBtnClick}
      customStyle={customStyle}
      leftIcon={
        icon ? (
          <img
            src={icon}
            alt={name}
            className={`w-4 h-4 ${customImageStyle}`}
          />
        ) : (
          customIcon
        )
      }
    >
      <span className={`font-semibold text-heading ${customTextStyle}`}>
        {name}
      </span>
    </Button>
  );
};

export default ButtonIcon;
