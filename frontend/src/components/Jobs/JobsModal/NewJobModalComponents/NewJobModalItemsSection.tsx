import { useMemo } from 'react';
import { TAddJob } from '../../../../types/Job';
import { TModalLineItem } from '../../../../types/LineItem';
import { Plus } from 'lucide-react';

interface INewJobModalItemsSection {
  newJob: TAddJob;
  setNewJob: React.Dispatch<React.SetStateAction<TAddJob>>;
  setIsPricebookModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLineItems: TModalLineItem[];
  setSelectedLineItems: React.Dispatch<React.SetStateAction<TModalLineItem[]>>;
}

const NewJobModalItemsSection = ({
  newJob,
  setNewJob,
  setIsPricebookModalOpen,
  selectedLineItems,
  setSelectedLineItems,
}: INewJobModalItemsSection) => {
  const subtotal = useMemo(() => {
    return selectedLineItems.reduce(
      (sum, item) => sum + item.serviceItem.unitPrice * item.quantity,
      0
    );
  }, [newJob.lineItems]);
  const tax = useMemo(() => {
    return selectedLineItems.reduce(
      (sum, item) =>
        sum +
        item.serviceItem.unitPrice *
          item.quantity *
          (item.serviceItem.taxRate / 100),
      0
    );
  }, [newJob.lineItems]);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium text-gray-900'>Line Items</h3>
        <p className='text-sm text-gray-500'>
          Add services or products for this job
        </p>
      </div>

      <div className='flex space-x-3'>
        <button
          onClick={() => setIsPricebookModalOpen(true)}
          className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center cursor-pointer'
        >
          <Plus className='h-4 w-4 mr-1' />
          Add from Pricebook
        </button>
        <button
          // onClick={() =>
          //   handleAddLineItem({
          //     name: '',
          //     description: '',
          //     unitPrice: 0,
          //   })
          // }
          className='bg-white text-blue-600 px-4 py-2 border border-blue-600 rounded-md text-sm flex items-center cursor-pointer'
        >
          <Plus className='h-4 w-4 mr-1' />
          Add Custom Item
        </button>
      </div>

      {selectedLineItems.length > 0 ? (
        <div className='space-y-4'>
          <div className='grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider'>
            <div className='col-span-5'>Item</div>
            <div className='col-span-2 text-right'>Qty</div>
            <div className='col-span-3 text-right'>Price</div>
            <div className='col-span-2 text-right'>Total</div>
          </div>

          {selectedLineItems.map((item) => (
            <div
              key={item.serviceItemId}
              className='grid grid-cols-12 gap-4 items-center border-b border-gray-200 pb-3'
            >
              <div className='col-span-5'>
                <input
                  type='text'
                  value={item.serviceItem?.name}
                  // onChange={(e) => {
                  //   setNewJob((prev) => ({
                  //     ...prev,
                  //     lineItems: prev.lineItems.map((i) =>
                  //       i.lineItemId === item.lineItemId
                  //         ? { ...i, name: e.target.value }
                  //         : i
                  //     ),
                  //   }));
                  // }}
                  className='w-full px-2 py-1 border border-gray-300 rounded text-sm'
                />
                {/* {item.isCustom && (
                          <input
                            type='text'
                            placeholder='Description'
                            value={item.description || ''}
                            onChange={(e) => {
                              setJobDetails((prev) => ({
                                ...prev,
                                lineItems: prev.lineItems.map((i) =>
                                  i.id === item.id
                                    ? { ...i, description: e.target.value }
                                    : i
                                ),
                              }));
                            }}
                            className='w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm'
                          />
                        )} */}
              </div>
              <div className='col-span-2'>
                <input
                  type='number'
                  min='1'
                  value={item.quantity}
                  onChange={(e) =>
                    setSelectedLineItems(
                      selectedLineItems.map((lineItem) =>
                        lineItem.serviceItemId === item.serviceItemId
                          ? {
                              ...lineItem,
                              quantity: parseInt(e.target.value),
                            }
                          : lineItem
                      )
                    )
                  }
                  className='w-full px-2 py-1 border border-gray-300 rounded text-sm text-right'
                />
              </div>
              <div className='col-span-3 text-right'>
                <input
                  type='number'
                  step='0.01'
                  min='0'
                  value={item.serviceItem?.unitPrice.toFixed(2)}
                  // onChange={(e) => {
                  //   setNewJob((prev) => ({
                  //     ...prev,
                  //     lineItems: prev.lineItems.map((i) =>
                  //       i.lineItemId === item.lineItemId
                  //         ? {
                  //             ...i,
                  //             price: parseFloat(e.target.value) || 0,
                  //           }
                  //         : i
                  //     ),
                  //   }));
                  // }}
                  className='w-full px-2 py-1 border border-gray-300 rounded text-sm text-right'
                />
              </div>
              <div className='col-span-2 text-right'>
                <span className='font-medium'>
                  ${(item.serviceItem?.unitPrice * item.quantity).toFixed(2)}
                </span>
                {/* Button shoudl be placed infront of lien item not at the end, remove this code after completion */}
                {/* <button
                          // onClick={() => handleRemoveLineItem(item.lineItemId)}
                          className='text-red-500 hover:text-red-700'
                        >
                          {/* <TrashIcon className='h-4 w-4' /> */}
                {/* </button> */}
              </div>
            </div>
          ))}

          <div className='mt-6 space-y-2'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Subtotal</span>
              <span className='font-medium'>${subtotal.toFixed(2)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>
                Tax (
                {selectedLineItems[0]?.serviceItem?.taxRate
                  ? selectedLineItems[0]?.serviceItem?.taxRate
                  : 0}
                %)
              </span>
              <span className='font-medium'>${tax.toFixed(2)}</span>
            </div>
            <div className='flex justify-between pt-2 border-t border-gray-200'>
              <span className='text-gray-900 font-medium'>Total</span>
              <span className='text-lg font-bold'>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className='mt-6 space-y-4'>
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='sendInvoice'
                checked={newJob.sendInvoice}
                onChange={(e) =>
                  setNewJob((prev) => ({
                    ...prev,
                    sendInvoice: e.target.checked,
                  }))
                }
                className='h-4 w-4 text-blue-600'
              />
              <label
                htmlFor='sendInvoice'
                className='ml-2 text-sm text-gray-700'
              >
                Send invoice after job completion
              </label>
            </div>
            <div className='flex items-center'>
              <input
                type='checkbox'
                id='sendReminder'
                checked={newJob.sendReminder}
                onChange={(e) =>
                  setNewJob((prev) => ({
                    ...prev,
                    sendReminder: e.target.checked,
                  }))
                }
                className='h-4 w-4 text-blue-600'
              />
              <label
                htmlFor='sendReminder'
                className='ml-2 text-sm text-gray-700'
              >
                Send reminder before job
              </label>
            </div>
            {newJob.sendReminder && (
              <div className='ml-6 flex items-center'>
                <span className='text-sm text-gray-700 mr-2'>Remind</span>
                <input
                  type='number'
                  min='1'
                  max='7'
                  value={newJob.reminderDaysBefore}
                  onChange={(e) =>
                    setNewJob((prev) => ({
                      ...prev,
                      reminderDays: parseInt(e.target.value) || 1,
                    }))
                  }
                  className='w-16 px-2 py-1 border border-gray-300 rounded text-sm'
                />
                <span className='text-sm text-gray-700 ml-2'>
                  day(s) before
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg'>
          No line items added yet. Add services or products from your pricebook
          or create custom items.
        </div>
      )}
    </div>
  );
};

export default NewJobModalItemsSection;
