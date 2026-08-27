import { useEffect, useState } from 'react';
import { TAddJob } from '../../../../types/Job';
import { GetServiceItemsByWorkspace } from '../../../../services/ServiceItem';
import { TServiceItem } from '../../../../types/ServiceItem';
import { TModalLineItem } from '../../../../types/LineItem';
import { X } from 'lucide-react';
import { useAuth } from '../../../../context/AuthProvider';

interface IPricebookModal {
  setNewJob: React.Dispatch<React.SetStateAction<TAddJob>>;
  setIsPricebookModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedLineItems: React.Dispatch<React.SetStateAction<TModalLineItem[]>>;
}
const PricebookModal = ({
  setNewJob,
  setIsPricebookModalOpen,
  setSelectedLineItems,
}: IPricebookModal) => {
  const { user } = useAuth();
  const [pricebookItems, setPricebookItems] = useState<TServiceItem[]>([]);

  const fetchPricebookItems = async () => {
    if (!user || !user.workspace) return;
    const response = await GetServiceItemsByWorkspace(
      user.workspace.id,
      1,
      1000
    );
    if (response.status === 200) {
      setPricebookItems(response.data.payload.items);
    }
  };

  useEffect(() => {
    fetchPricebookItems();
  }, []);
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col'>
        <div className='border-b border-gray-200 px-6 py-4 flex justify-between items-center'>
          <h3 className='text-lg font-medium text-gray-900'>
            Add from Pricebook
          </h3>
          <button
            onClick={() => setIsPricebookModalOpen(false)}
            className='text-gray-500 hover:text-gray-700 cursor-pointer'
          >
            <X className='h-6 w-6' />
          </button>
        </div>
        <div className='p-4'>
          <input
            type='text'
            placeholder='Search pricebook items'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg mb-4'
          />
          <div className='space-y-2 max-h-[60vh] overflow-y-auto'>
            {pricebookItems.map((item) => (
              <div
                key={item.serviceItemId}
                onClick={() => {
                  setNewJob((prev) => ({
                    ...prev,
                    lineItems: [
                      ...prev.lineItems,
                      { serviceItemId: item.serviceItemId, quantity: 1 },
                    ],
                  }));
                  setSelectedLineItems((prev) => [
                    ...prev,
                    {
                      serviceItemId: item.serviceItemId,
                      serviceItem: item,
                      quantity: 1,
                    },
                  ]);
                  setIsPricebookModalOpen(false);
                }}
                className='p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'
              >
                <div className='flex justify-between'>
                  <h4 className='font-medium'>{item.name}</h4>
                  <span className='text-blue-600'>
                    ${item.unitPrice.toFixed(2)}
                  </span>
                </div>
                {item.description && (
                  <p className='text-sm text-gray-500 mt-1'>
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricebookModal;
