import { ReactNode } from 'react';
import Button from './Button';

interface IButtonIcon {
  name?: string;
  icon?: string;
  customIcon?: ReactNode;
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
  customStyle,
  customTextStyle,
  customImageStyle,
  handleBtnClick,
  buttonType,
}: IButtonIcon) => {
  return (
    <Button
      type={buttonType}
      variant='secondary'
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
