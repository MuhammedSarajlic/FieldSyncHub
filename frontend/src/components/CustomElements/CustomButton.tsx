import Button from './Button';

interface ICustomButton {
  title: string;
  customStyle?: string;
  handleBtnClick?: () => void;
  isDisabled?: boolean;
}

const CustomButton = ({
  title,
  customStyle,
  handleBtnClick,
  isDisabled,
}: ICustomButton) => {
  return (
    <Button
      variant='primary'
      onClick={handleBtnClick}
      disabled={isDisabled}
      customStyle={customStyle}
    >
      {title}
    </Button>
  );
};

export default CustomButton;
