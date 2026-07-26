import { ReactNode } from 'react';
import Button, { ButtonVariant } from './Button';

interface ICustomIconButton {
  icon: ReactNode;
  text: string;
  variant?: ButtonVariant;
  handleClick?: () => void;
  customStyle?: string;
}

const CustomIconButton = ({
  icon,
  text,
  variant = 'primary',
  handleClick,
  customStyle,
}: ICustomIconButton) => {
  return (
    <Button
      variant={variant}
      onClick={handleClick}
      customStyle={customStyle}
      leftIcon={icon}
    >
      {text}
    </Button>
  );
};

export default CustomIconButton;
