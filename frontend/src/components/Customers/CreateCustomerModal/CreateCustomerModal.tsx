import ButtonIcon from '../../CustomElements/ButtonIcon';
import CustomButton from '../../CustomElements/CustomButton';
import icons from '../../../constants/icons';
import CreateCustomerForm from './CreateCustomerForm';

interface ICreateCustomerModal {
  setIsAddCustomerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateCustomerModal = ({
  setIsAddCustomerModalOpen,
}: ICreateCustomerModal) => {
  return (
    <div className='fixed top-0 left-0 w-full h-screen bg-black/50 flex items-center justify-center'>
      <div className='py-6 bg-white rounded-lg w-2/3 h-[95vh] flex flex-col'>
        <div className='px-6 pb-4 h-14 flex items-center justify-between'>
          <p className='text-2xl font-bold text-heading'>New Customer</p>
          <div
            onClick={() => setIsAddCustomerModalOpen(false)}
            className='p-3 cursor-pointer bg-[#ececec] rounded-md hover:bg-[#dddddd] transition-colors duration-200'
          >
            <img src={icons.closeIcon} alt='close' className='w-3.5 h-3.5' />
          </div>
        </div>

        <div className='flex-grow overflow-y-auto'>
          <CreateCustomerForm />
        </div>

        <div className='px-6 pt-4 h-14 flex items-center justify-end space-x-3'>
          <ButtonIcon
            name='Close'
            handleBtnClick={() => setIsAddCustomerModalOpen(false)}
          />
          <CustomButton title='Save Customer' />
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
