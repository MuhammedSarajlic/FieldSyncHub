import { ReactNode } from 'react';
import Button, { ButtonVariant } from '../Button';

interface ICustomButton {
  children: ReactNode;
  variant?: ButtonVariant;
  customStyle?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const CustomButton = ({
  children,
  variant = 'secondary',
  customStyle,
  onClick,
  disabled,
}: ICustomButton) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      customStyle={customStyle}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
