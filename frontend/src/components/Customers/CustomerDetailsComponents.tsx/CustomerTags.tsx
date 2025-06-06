import { useEffect, useState } from 'react';
import { X, Tag, Plus } from 'lucide-react';
import { AddCustomerTag, RemoveCustomerTag } from '../../../services/Customer';

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
          <button
            onClick={() => setIsAddingTag(true)}
            className='text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1'
          >
            <Plus className='w-4 h-4' />
            Add tag
          </button>
        ) : null}
      </div>

      {isAddingTag && (
        <div className='flex gap-2 mb-4'>
          <input
            type='text'
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder='Enter tag name'
            className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
            onKeyDown={(e) => e.key === 'Enter' && addCustomerTag()}
          />
          <button
            onClick={addCustomerTag}
            className='cursor-pointer min-w-24 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700'
          >
            Add
          </button>
        </div>
      )}

      {localTags?.length > 0 ? (
        <div className='flex flex-wrap gap-2 mr-8'>
          {localTags.map((tag, index) => (
            <span
              key={index}
              className='group relative inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 hover:pr-8 transition-all duration-200'
            >
              {tag}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeCustomerTag(tag);
                }}
                className='absolute right-2 opacity-0 cursor-pointer group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200'
              >
                <X className='w-4 h-4 text-blue-400 hover:text-blue-700' />
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
