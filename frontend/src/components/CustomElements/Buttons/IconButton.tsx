import { ReactNode, forwardRef } from 'react';
import Button, { ButtonVariant } from '../Button';

interface IIconButton {
  children?: ReactNode;
  icon: ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: ButtonVariant;
  customStyle?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IIconButton>(
  (
    {
      children,
      icon,
      iconPosition = 'left',
      variant = 'secondary',
      customStyle = '',
      onClick,
      disabled,
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        customStyle={customStyle}
        leftIcon={iconPosition === 'left' ? icon : undefined}
        rightIcon={iconPosition === 'right' ? icon : undefined}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
