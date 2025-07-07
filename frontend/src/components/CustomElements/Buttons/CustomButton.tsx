import { ReactNode } from 'react';

interface ICustomButton {
  children: ReactNode;
  customStyle?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const CustomButton = ({
  children,
  customStyle,
  onClick,
  disabled,
}: ICustomButton) => {
  const baseClasses = `
    border border-gray-200
    py-1 px-3 rounded-lg
    text-sm font-medium text-gray-700
    transition-colors
  `;

  return (
    <button
      disabled={disabled}
      className={`
    ${baseClasses}
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    ${customStyle}
  `}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CustomButton;
