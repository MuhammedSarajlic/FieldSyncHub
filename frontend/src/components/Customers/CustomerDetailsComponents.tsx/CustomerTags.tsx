import { useState } from 'react';
import icons from '../../../constants/icons';
import { AddCustomerTag, RemoveCustomerTag } from '../../../services/Customer';
import CustomButton from '../../CustomElements/CustomButton';
import CustomSmallButton from '../../CustomElements/CustomSmallButton';

interface ICustomerTags {
  tags: string[];
  customerId: string;
  fetchCustomer: () => Promise<void>;
}

const CustomerTags = ({ tags, customerId, fetchCustomer }: ICustomerTags) => {
  const [newTag, setNewTag] = useState<string>('');
  const [isAddTagOpen, setIsAddTagOpen] = useState<boolean>(false);

  const addCustomerTag = async () => {
    const response = await AddCustomerTag(customerId, newTag);
    if (response.status === 200) {
      await fetchCustomer();
      setNewTag('');
    }
  };

  const removeCustomerTag = async (tag: string) => {
    const response = await RemoveCustomerTag(customerId, tag);
    if (response.status === 200) {
      await fetchCustomer();
    }
  };

  return (
    <div className='w-full space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <img src={icons.tagIcon} alt='tag' className='w-5 h-5' />
          <p className='font-semibold text-xl'>Tags</p>
        </div>
        {!isAddTagOpen && (
          <CustomSmallButton
            title='New tag'
            customStyle='px-4'
            handleClick={() => setIsAddTagOpen(true)}
          />
        )}
      </div>
      {isAddTagOpen && (
        <div className='flex items-center space-x-2'>
          <input
            type='text'
            placeholder='Tag name'
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className={`w-full px-3 py-2 text-sm text-heading outline-none border-[1px] border-border-primary rounded-lg`}
          />
          <CustomButton
            title='Add tag'
            customStyle='min-w-[110px]'
            handleBtnClick={addCustomerTag}
          />
        </div>
      )}
      <div className='flex flex-wrap items-center space-x-2 gap-y-2'>
        {tags && tags.length > 0 ? (
          tags.map((tag, index) => (
            <div
              key={index}
              className='flex items-center bg-bg-primary/20 px-3 py-1 rounded-full group'
            >
              <p className='text-sm text-heading font-medium'>{tag}</p>
              <img
                onClick={() => removeCustomerTag(tag)}
                src={icons.closeIcon}
                alt='close'
                className='hidden w-2.5 h-2.5 cursor-pointer group-hover:block group-hover:ml-1.5'
              />
            </div>
          ))
        ) : (
          <p className='text-sm'>This client has no tags</p>
        )}
      </div>
    </div>
  );
};

export default CustomerTags;
