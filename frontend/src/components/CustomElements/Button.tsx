import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface IButton extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  customStyle?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-bg-primary text-white border border-bg-primary hover:bg-bg-primary-hover',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  outline:
    'bg-transparent text-bg-primary border border-bg-primary hover:bg-bg-primary/10',
  ghost:
    'bg-transparent text-gray-700 border border-transparent hover:bg-gray-100',
  danger:
    'bg-red-600 text-white border border-red-600 hover:bg-red-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-3.5 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
};

const Button = forwardRef<HTMLButtonElement, IButton>(
  (
    {
      children,
      variant = 'secondary',
      size = 'sm',
      leftIcon,
      rightIcon,
      fullWidth,
      customStyle = '',
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(
          'inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors duration-150',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          customStyle
        )}
        {...rest}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
