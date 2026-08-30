import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import Button, { ButtonVariant } from '../Button';

interface IIconButton extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  children?: ReactNode;
  icon: ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: ButtonVariant;
  customStyle?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IIconButton>(
  (
    {
      children,
      icon,
      iconPosition = 'left',
      variant = 'secondary',
      customStyle = '',
      'aria-label': ariaLabel,
      title,
      ...buttonProps
    },
    ref
  ) => {
    const isIconOnly = children == null;
    const accessibleLabel = ariaLabel ?? (isIconOnly ? 'Action' : undefined);

    return (
      <Button
        ref={ref}
        variant={variant}
        customStyle={customStyle}
        leftIcon={iconPosition === 'left' ? icon : undefined}
        rightIcon={iconPosition === 'right' ? icon : undefined}
        aria-label={accessibleLabel}
        title={title ?? (isIconOnly ? accessibleLabel : undefined)}
        {...buttonProps}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
