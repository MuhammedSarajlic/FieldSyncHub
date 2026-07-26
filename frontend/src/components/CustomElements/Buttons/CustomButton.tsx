import { ReactNode } from 'react';
import Button from '../Button';

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
  return (
    <Button
      variant='secondary'
      onClick={onClick}
      disabled={disabled}
      customStyle={customStyle}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
