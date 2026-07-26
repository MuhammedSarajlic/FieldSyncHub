import { ReactNode, forwardRef } from 'react';
import Button from '../Button';

interface IIconButton {
  children?: ReactNode;
  icon: ReactNode;
  iconPosition?: 'left' | 'right';
  customStyle?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const IconButton = forwardRef<HTMLButtonElement, IIconButton>(
  (
    { children, icon, iconPosition = 'left', customStyle = '', onClick, disabled },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant='secondary'
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
