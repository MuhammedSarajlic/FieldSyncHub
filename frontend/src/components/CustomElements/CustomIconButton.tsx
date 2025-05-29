import { ReactNode } from 'react';

interface ICustomIconButton {
  icon: ReactNode;
  text: string;
  handleClick?: () => void;
  customStyle?: string;
}

const CustomIconButton = ({
  icon,
  text,
  handleClick,
  customStyle,
}: ICustomIconButton) => {
  return (
    <button
      onClick={handleClick}
      className={`whitespace-nowrap bg-bg-primary hover:bg-bg-primary-hover border-[1px] border-bg-primary text-white px-4 py-2 rounded-lg flex items-center text-sm cursor-pointer transition-colors duration-200 ${customStyle}`}
    >
      {icon}
      {text}
    </button>
  );
};

export default CustomIconButton;
