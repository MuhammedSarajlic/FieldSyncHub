// ServiceItemDetails.tsx
import { useEffect, useState } from 'react';
import {
  Edit3,
  Package,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  AlertCircle,
  CheckCircle2,
  Wrench,
  X, // Added X for the check/uncheck icons
} from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import CustomIconButton from '../../components/CustomElements/CustomIconButton';
import { ServiceItemType } from '../../constants/Enumeration/ServiceItem/ServiceItem';
import { useNavigate, useParams } from 'react-router';
import {
  DeleteServiceItem,
  GetServiceItemById,
  // UpdateServiceItem // Removed, as logic moved to modal
} from '../../services/ServiceItem';
import { TServiceItem } from '../../types/ServiceItem';
import { formatDate } from '../../utils/FuntionHelpers/formatDate';
import toast from 'react-hot-toast'; // For toast notifications
import EditServiceItemModal from '../../components/Pricebook/PricebookModals/EditServiceItemModal';

const ServiceItemDetails = () => {
  const { serviceItemId } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // New state for edit modal
  const [serviceItem, setServiceItem] = useState<TServiceItem | null>(null);

  const handleDeleteServiceItem = async () => {
    if (!serviceItemId) return;
    const response = await DeleteServiceItem(serviceItemId);
    if (response.status === 200) {
      toast.success('Service item deleted successfully!');
      navigate('/pricebook'); // Redirect after deletion
    } else {
      toast.error('Failed to delete service item.');
    }
  };

  const handleUpdateServiceItem = (updatedItem: TServiceItem) => {
    // This callback is called from the modal after a successful update
    setServiceItem(updatedItem); // Update the local state with the new data
    setShowEditModal(false); // Close the modal
    // No need to re-fetch if the modal returns the updated object
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy to clipboard.');
      });
  };

  const fetchServiceItem = async () => {
    if (!serviceItemId) return;
    const response = await GetServiceItemById(serviceItemId);
    if (response.status === 200) {
      setServiceItem(response.data);
    } else {
      toast.error('Failed to load service item details.');
      // Optionally navigate away or show a specific error state
    }
  };

  useEffect(() => {
    fetchServiceItem();
  }, [serviceItemId]); // Re-fetch if serviceItemId changes

  const calculateProfitMargin = () => {
    if (!serviceItem) return '0.0';
    const profit = serviceItem.unitPrice - serviceItem.cost;
    const margin =
      serviceItem.unitPrice > 0 ? (profit / serviceItem.unitPrice) * 100 : 0;
    return margin.toFixed(1);
  };

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 ml-64'>
        <Navbar />
        {serviceItem ? (
          <>
            <div className='bg-white border-b border-gray-200'>
              <div className='px-6'>
                <div className='flex items-center justify-between py-2.5'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className='w-10 h-10 rounded-lg flex items-center justify-center'
                        style={{ backgroundColor: '#356852' }}
                      >
                        {serviceItem.type === ServiceItemType.Service ? (
                          <Package className='w-5 h-5 text-white' />
                        ) : (
                          <Wrench className='w-5 h-5 text-white' />
                        )}
                      </div>
                      <div>
                        <h1 className='text-xl font-semibold text-gray-900'>
                          {serviceItem.name}
                        </h1>
                        <p className='text-sm text-gray-500'>
                          Service Item Details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-3'>
                    {/* The "Edit" button now opens the modal */}
                    <CustomIconButton
                      handleClick={() => setShowEditModal(true)}
                      icon={<Edit3 className='w-4 h-4 mr-2' />}
                      text='Edit'
                    />
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className='flex items-center px-4 py-2 cursor-pointer border-[1px] border-red-50 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors'
                    >
                      <Trash2 className='w-4 h-4 mr-2' />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Left Column - Main Details */}
                <div className='lg:col-span-2 space-y-6'>
                  {/* Basic Information */}
                  <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
                    <div className='px-6 py-4 border-b border-gray-200'>
                      <h2 className='text-lg font-medium text-gray-900'>
                        Basic Information
                      </h2>
                    </div>
                    <div className='p-6 space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Service Name
                          </label>
                          <p className='text-gray-900 font-medium'>
                            {serviceItem.name}
                          </p>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            SKU
                          </label>
                          <div className='flex items-center space-x-2'>
                            <p
                              className={`${
                                serviceItem.sku
                                  ? 'text-gray-900'
                                  : 'text-gray-500'
                              }`}
                            >
                              {serviceItem.sku || 'SKU not provided'}
                            </p>
                            {serviceItem.sku && (
                              <button
                                onClick={() => copyToClipboard(serviceItem.sku)}
                                className='cursor-pointer text-gray-400 hover:text-gray-600'
                              >
                                <Copy className='w-4 h-4' />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Type
                          </label>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {ServiceItemType[serviceItem.type]}
                          </span>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Category
                          </label>
                          <p className='text-gray-900'>
                            {serviceItem.category}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Description
                        </label>
                        <p className='text-gray-600'>
                          {serviceItem.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Cost */}
                  <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
                    <div className='px-6 py-4 border-b border-gray-200'>
                      <h2 className='text-lg font-medium text-gray-900'>
                        Pricing & Cost
                      </h2>
                    </div>
                    <div className='p-6'>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Unit Price
                          </label>
                          <p className='text-2xl font-bold text-gray-900'>
                            ${serviceItem.unitPrice.toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Cost
                          </label>
                          <p className='text-xl font-semibold text-gray-700'>
                            ${serviceItem.cost.toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Profit Margin
                          </label>
                          <p className='text-xl font-semibold text-green-600'>
                            {calculateProfitMargin()}%
                          </p>
                          <p className='text-sm text-gray-500'>
                            $
                            {(serviceItem.unitPrice - serviceItem.cost).toFixed(
                              2
                            )}{' '}
                            profit
                          </p>
                        </div>
                      </div>

                      <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Tax Rate (%)
                          </label>
                          <p className='text-gray-900'>
                            {serviceItem.taxRate * 100}%
                          </p>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Taxable
                          </label>
                          <div className='flex items-center'>
                            {serviceItem.isTaxable ? (
                              <CheckCircle2 className='w-5 h-5 text-green-500 mr-2' />
                            ) : (
                              <X className='w-5 h-5 text-red-500 mr-2' />
                            )}
                            <span className='text-gray-900'>
                              {serviceItem.isTaxable ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Image & Status */}
                <div className='space-y-6'>
                  {/* Service Image */}
                  <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
                    <div className='px-6 py-4 border-b border-gray-200'>
                      <h2 className='text-lg font-medium text-gray-900'>
                        Service Image
                      </h2>
                    </div>
                    <div className='p-6'>
                      <div className='space-y-4'>
                        {serviceItem.imageUrl ? (
                          <div className='relative'>
                            <img
                              src={serviceItem.imageUrl}
                              alt={serviceItem.name}
                              className='w-full h-48 object-contain rounded-lg'
                            />
                          </div>
                        ) : (
                          <div className='w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center'>
                            <div className='flex flex-col items-center text-gray-400'>
                              <Package className='w-8 h-8 mb-2' />
                              <span className='text-sm'>No image</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Settings */}
                  <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
                    <div className='px-6 py-4 border-b border-gray-200'>
                      <h2 className='text-lg font-medium text-gray-900'>
                        Status & Settings
                      </h2>
                    </div>
                    <div className='p-6 space-y-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-700'>
                          Active Status
                        </span>
                        <div className='flex items-center'>
                          {serviceItem.isActive ? (
                            <>
                              <Eye className='w-4 h-4 text-green-500 mr-1' />
                              <span className='text-sm font-medium text-green-600'>
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <EyeOff className='w-4 h-4 text-gray-400 mr-1' />
                              <span className='text-sm font-medium text-gray-500'>
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className='pt-4 border-t border-gray-200'>
                        <div className='space-y-3 text-sm'>
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>Service ID</span>
                            <span className='text-gray-900 font-mono text-right'>
                              {serviceItem.id}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>Created</span>
                            <span className='text-gray-900'>
                              {formatDate(serviceItem.createdAt)}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>Last Updated</span>
                            <span className='text-gray-900'>
                              {formatDate(serviceItem.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Loading spinner moved here for when serviceItem is null
          <div className='w-full h-screen flex items-center justify-center'>
            <div className='flex flex-col items-center'>
              <div
                className='h-16 w-16 rounded-full animate-spin'
                style={{
                  border: '4px solid transparent',
                  borderTopColor: '#356852',
                  borderLeftColor: '#356852',
                }}
              ></div>
              <p className='text-lg font-semibold tracking-wide text-gray-800 dark:text-gray-200 mt-4'>
                Loading...
              </p>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && serviceItem && (
          <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
              <div className='p-6'>
                <div className='flex items-center mb-4'>
                  <div className='w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3'>
                    <AlertCircle className='w-5 h-5 text-red-600' />
                  </div>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Delete Service Item
                  </h3>
                </div>
                <p className='text-sm text-gray-500 mb-6'>
                  Are you sure you want to delete{' '}
                  <span className='font-semibold text-gray-900'>
                    "{serviceItem.name}"
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className='flex justify-end space-x-3'>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className='px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      handleDeleteServiceItem();
                    }}
                    className='px-4 py-2 cursor-pointer text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Service Item Modal */}
        {showEditModal && serviceItem && (
          <EditServiceItemModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            serviceItem={serviceItem} // Pass the current service item for editing
            onUpdate={handleUpdateServiceItem} // Callback to update serviceItem state
          />
        )}
      </div>
    </div>
  );
};

export default ServiceItemDetails;
