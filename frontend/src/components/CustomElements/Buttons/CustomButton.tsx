import { ReactNode } from 'react';

interface ICustomButton {
  children: ReactNode;
  customStyle?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const CustomButton = ({ children, customStyle, onClick }: ICustomButton) => {
  const baseClasses = `
    border border-gray-200
    py-1 px-3 rounded-lg cursor-pointer
    text-sm font-medium text-gray-700
  `;

  return (
    <button className={`${baseClasses} ${customStyle}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default CustomButton;
