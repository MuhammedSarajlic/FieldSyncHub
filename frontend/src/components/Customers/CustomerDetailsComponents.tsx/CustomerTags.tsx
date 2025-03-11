import icons from '../../../constants/icons';
import CustomButton from '../../CustomElements/CustomButton';

const CustomerTags = () => {
  return (
    <div className='w-full space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <img src={icons.tagIcon} alt='tag' className='w-5 h-5' />
          <p className='font-semibold text-xl'>Tags</p>
        </div>
        <div>
          <button
            className={`flex items-center space-x-1.5 border-[1px] border-border-primary rounded-lg py-1.5 px-4 cursor-pointer hover:bg-[#FAFAFA] hover:border-primary transition-colors duration-200`}
          >
            <p className={`text-sm font-semibold text-text-secondary`}>
              New tag
            </p>
          </button>
        </div>
      </div>
      {/* <div className='flex items-center space-x-2'>
        <input
          type='text'
          placeholder='Tag name'
          className={`w-full px-3 py-2 text-sm text-heading outline-none border-[1px] border-border-primary rounded-lg`}
        />
        <CustomButton title='Add tag' customStyle='min-w-[120px]' />
      </div> */}
      <div className='flex flex-wrap items-center space-x-2 gap-y-2'>
        <div className='bg-bg-primary/20 px-3 py-1 rounded-full'>
          <p className='text-sm text-heading font-medium'>Active</p>
        </div>
        <div className='bg-bg-primary/20 px-3 py-1 rounded-full'>
          <p className='text-sm text-heading font-medium'>Inactive</p>
        </div>
        {/* <p className='text-sm'>This client has no tags</p> */}
      </div>
    </div>
  );
};

export default CustomerTags;
