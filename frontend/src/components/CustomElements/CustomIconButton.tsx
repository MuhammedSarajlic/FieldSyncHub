import { ReactNode } from 'react';
import Button from './Button';

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
    <Button
      variant='primary'
      onClick={handleClick}
      customStyle={customStyle}
      leftIcon={icon}
    >
      {text}
    </Button>
  );
};

export default CustomIconButton;
