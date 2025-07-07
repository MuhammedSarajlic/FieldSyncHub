import { ReactNode } from 'react';

interface IIconButton {
  children: ReactNode;
  icon: ReactNode;
  iconPosition?: string;
  customStyle?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const IconButton = ({
  children,
  icon,
  iconPosition = 'left',
  customStyle = '',
  onClick,
  disabled,
}: IIconButton) => {
  const baseClasses = `
    flex items-center justify-center
    py-1 px-3 rounded-lg cursor-pointer
    text-sm font-medium text-gray-700
    border border-gray-200
  `;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${customStyle}`}
      onClick={handleClick}
    >
      {iconPosition === 'left' && icon && <span>{icon}</span>}
      {children}
      {iconPosition === 'right' && icon && <span>{icon}</span>}
    </button>
  );
};

export default IconButton;
