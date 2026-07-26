import { useEffect, useState } from 'react';
import { X, Tag, Plus } from 'lucide-react';
import { AddCustomerTag, RemoveCustomerTag } from '../../../services/Customer';
import Button from '../../CustomElements/Button';

interface ICustomerTags {
  tags: string[] | null;
  customerId: string;
}

const CustomerTags = ({ tags, customerId }: ICustomerTags) => {
  const [localTags, setLocalTags] = useState<string[]>(tags || []);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const addCustomerTag = async () => {
    if (!newTag.trim()) return;

    const response = await AddCustomerTag(customerId, newTag.trim());
    if (response.status === 200) {
      setLocalTags((prev) => [...(prev || []), newTag.trim()]);
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const removeCustomerTag = async (tag: string) => {
    const response = await RemoveCustomerTag(customerId, tag);
    if (response.status === 200) {
      setLocalTags((prev) => (prev || []).filter((t) => t !== tag));
    }
  };

  useEffect(() => {
    setLocalTags(tags || []);
  }, [tags]);

  return (
    <div className='bg-white rounded-lg border border-gray-100 shadow-sm p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
          <Tag className='w-5 h-5 text-gray-600' />
          Tags
        </h3>

        {!isAddingTag ? (
          <Button
            variant='ghost'
            onClick={() => setIsAddingTag(true)}
            customStyle='text-bg-primary hover:text-bg-primary-hover px-0'
            leftIcon={<Plus className='w-4 h-4' />}
          >
            Add tag
          </Button>
        ) : null}
      </div>

      {isAddingTag && (
        <div className='flex gap-2 mb-4'>
          <input
            type='text'
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder='Enter tag name'
            className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-bg-primary focus:border-bg-primary'
            onKeyDown={(e) => e.key === 'Enter' && addCustomerTag()}
          />
          <Button
            variant='primary'
            onClick={addCustomerTag}
            customStyle='min-w-24'
          >
            Add
          </Button>
        </div>
      )}

      {localTags?.length > 0 ? (
        <div className='flex flex-wrap gap-2 mr-8'>
          {localTags.map((tag, index) => (
            <span
              key={index}
              className='group relative inline-flex items-center px-3 py-1 rounded-full text-sm bg-bg-primary/10 text-bg-primary hover:pr-8 transition-all duration-200'
            >
              {tag}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeCustomerTag(tag);
                }}
                className='absolute right-2 opacity-0 cursor-pointer group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200'
              >
                <X className='w-4 h-4 text-bg-primary/60 hover:text-bg-primary' />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className='text-gray-500 text-sm'>No tags assigned</p>
      )}
    </div>
  );
};

export default CustomerTags;
