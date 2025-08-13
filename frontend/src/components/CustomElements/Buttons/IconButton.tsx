import { ReactNode, forwardRef } from 'react';

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
    {
      children,
      icon,
      iconPosition = 'left',
      customStyle = '',
      onClick,
      disabled,
    },
    ref
  ) => {
    const baseClasses = `
      flex items-center justify-center
      py-1 px-3 rounded-lg cursor-pointer
      text-sm font-medium text-gray-700
      border border-gray-200
    `;

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseClasses} ${customStyle}`}
        onClick={onClick}
      >
        {iconPosition === 'left' && icon && <span>{icon}</span>}
        {children}
        {iconPosition === 'right' && icon && <span>{icon}</span>}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
