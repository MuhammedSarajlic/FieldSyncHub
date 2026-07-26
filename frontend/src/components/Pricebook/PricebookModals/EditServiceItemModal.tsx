// components/Modals/EditServiceItemModal.tsx
import { useRef, useState, useEffect } from 'react';
import {
  FileImage,
  FileText,
  Package,
  X,
  UploadCloud,
  CheckCircle,
  Calculator,
} from 'lucide-react';
import toast from 'react-hot-toast'; // For toast notifications
import { TServiceItem, TUpdateServiceItem } from '../../../types/ServiceItem';
import { ServiceItemType } from '../../../constants/Enumeration/ServiceItem/ServiceItem';
import { uploadFileWithProgress } from '../../../storage/uploadFileWithProgress';
import { UpdateServiceItem } from '../../../services/ServiceItem';
import CustomButton from '../../CustomElements/CustomButton';

interface IEditServiceItemModal {
  isOpen: boolean;
  onClose: () => void;
  serviceItem: TServiceItem | null; // The existing service item data
  onUpdate: (updatedItem: TServiceItem) => void; // Callback after successful update
}

const EditServiceItemModal = ({
  isOpen,
  onClose,
  serviceItem,
  onUpdate,
}: IEditServiceItemModal) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<TUpdateServiceItem>({
    id: '',
    name: '',
    description: '',
    type: ServiceItemType.Service,
    category: '',
    sku: '',
    unitPrice: 0,
    cost: 0,
    taxRate: 0,
    isTaxable: false,
    isActive: true,
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Effect to initialize form data when serviceItem prop changes
  useEffect(() => {
    if (serviceItem) {
      setFormData({
        id: serviceItem.id,
        name: serviceItem.name,
        description: serviceItem.description || '',
        type: serviceItem.type,
        category: serviceItem.category,
        sku: serviceItem.sku || '',
        unitPrice: serviceItem.unitPrice,
        cost: serviceItem.cost,
        taxRate: serviceItem.taxRate * 100, // Convert back to percentage for input field
        isTaxable: serviceItem.isTaxable,
        isActive: serviceItem.isActive,
        imageUrl: serviceItem.imageUrl || '',
      });
      // Set initial image preview if an image already exists
      setImagePreviewUrl(serviceItem.imageUrl || null);
    }
  }, [serviceItem]);

  // Effect to handle image preview URL for new file selections
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setImagePreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (!serviceItem?.imageUrl) {
      // Only clear if no existing image
      setImagePreviewUrl(null);
    }
  }, [selectedFile, serviceItem]);

  // Effect to handle taxRate when isTaxable changes
  useEffect(() => {
    if (!formData.isTaxable) {
      setFormData((prev) => ({ ...prev, taxRate: 0 }));
    }
  }, [formData.isTaxable]);

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.category.trim()) newErrors.category = true;
    if (formData.unitPrice <= 0) newErrors.unitPrice = true;
    if (formData.cost <= 0) newErrors.cost = true;
    return newErrors;
  };

  const handleUpdateItem = async () => {
    if (!serviceItem?.id) {
      toast.error('Service Item ID is missing.');
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please correct the highlighted fields.');
      return;
    }

    setUploading(true);
    let finalImageUrl = formData.imageUrl; // Start with current image URL

    try {
      if (selectedFile) {
        // A new file has been selected, upload it
        const uploadResult = await uploadFileWithProgress(
          selectedFile,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        if (uploadResult.status === 'Completed' && uploadResult.downloadURL) {
          finalImageUrl = uploadResult.downloadURL;
          toast.success('Image uploaded successfully!');
        } else {
          console.error('File upload failed:', uploadResult.error);
          toast.error('Image upload failed. Please try again.');
          setUploading(false);
          return;
        }
      } else if (imagePreviewUrl === null && serviceItem?.imageUrl) {
        // Image was removed, set imageUrl to empty
        finalImageUrl = '';
      }

      const payload: TUpdateServiceItem = {
        ...formData,
        taxRate: formData.isTaxable ? formData.taxRate / 100 : 0, // Convert back to decimal for storage
        imageUrl: finalImageUrl,
      };

      // Perform the update API call
      const result = await UpdateServiceItem(payload);

      if (result.status === 200) {
        toast.success('Service item updated successfully!');
        // Call the onUpdate callback with the latest data
        onUpdate({
          ...serviceItem,
          ...payload,
          updatedAt: new Date().toISOString(),
        });
        onClose();
      } else {
        console.error(
          'Failed to update service item:',
          result.data?.message ?? 'Unknown error'
        );
        toast.error(
          `Failed to update: ${result.data?.message || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('An unexpected error occurred during update:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0); // Reset progress
      setSelectedFile(null); // Clear selected file
    }
  };

  if (!isOpen || !serviceItem) return null; // Don't render if not open or no serviceItem

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-inter'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-white flex justify-between items-center px-8 py-6 border-b border-gray-200 shadow-sm'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Edit Service Item: {serviceItem.name}
            </h2>
            <p className='text-gray-600 text-sm mt-1'>
              Modify details for this service or material item
            </p>
          </div>
          <button
            onClick={onClose}
            className='w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600'
            aria-label='Close modal'
            disabled={uploading}
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Main Content Area */}
        <div className='flex-1 overflow-y-auto px-8 py-6 space-y-8'>
          {/* Type Selector Section */}
          <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
            <div className='flex items-center space-x-3 mb-6'>
              <Package className='w-5 h-5 text-[#356852]' />
              <h3 className='font-semibold text-lg text-gray-900'>Item Type</h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {[ServiceItemType.Service, ServiceItemType.Material].map(
                (type) => (
                  <button
                    key={type}
                    type='button'
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.type === type
                        ? 'border-[#356852] bg-[#e6f4ed] text-[#356852] shadow-md'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={uploading}
                  >
                    {type === ServiceItemType.Service ? (
                      <>
                        <FileText className='w-5 h-5 mr-3' />
                        <span className='font-medium'>Service</span>
                      </>
                    ) : (
                      <>
                        <Package className='w-5 h-5 mr-3' />
                        <span className='font-medium'>Material</span>
                      </>
                    )}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Item Details Section */}
          <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
            <div className='flex items-center space-x-3 mb-6'>
              <FileText className='w-5 h-5 text-[#356852]' />
              <h3 className='font-semibold text-lg text-gray-900'>
                Item Details
              </h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  className={`w-full border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm`}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors((prev) => ({ ...prev, name: false }));
                  }}
                  placeholder='e.g., HVAC Maintenance'
                  disabled={uploading}
                />
                {errors.name && (
                  <p className='text-red-500 text-xs mt-1'>Name is required</p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Category <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  className={`w-full border ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm`}
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    setErrors((prev) => ({ ...prev, category: false }));
                  }}
                  placeholder='e.g., Plumbing, Electrical'
                  disabled={uploading}
                />
                {errors.category && (
                  <p className='text-red-500 text-xs mt-1'>
                    Category is required
                  </p>
                )}
              </div>
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Description
                </label>
                <textarea
                  className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] resize-y text-sm'
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Provide a detailed description of the service item...'
                  disabled={uploading}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory Section */}
          <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
            <div className='flex items-center space-x-3 mb-6'>
              <Calculator className='w-5 h-5 text-[#356852]' />
              <h3 className='font-semibold text-lg text-gray-900'>
                Pricing & Inventory
              </h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Unit Price <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  className={`w-full border ${
                    errors.unitPrice ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm`}
                  value={formData.unitPrice}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      unitPrice: parseFloat(e.target.value) || 0,
                    });
                    setErrors((prev) => ({ ...prev, unitPrice: false }));
                  }}
                  min='0'
                  step='0.01'
                  placeholder='0.00'
                  disabled={uploading}
                />
                {errors.unitPrice && (
                  <p className='text-red-500 text-xs mt-1'>
                    Unit Price is required and must be greater than 0
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Cost <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  className={`w-full border ${
                    errors.cost ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm`}
                  value={formData.cost}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      cost: parseFloat(e.target.value) || 0,
                    });
                    setErrors((prev) => ({ ...prev, cost: false }));
                  }}
                  min='0'
                  step='0.01'
                  placeholder='0.00'
                  disabled={uploading}
                />
                {errors.cost && (
                  <p className='text-red-500 text-xs mt-1'>
                    Cost is required and must be greater than 0
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tax Rate (%)
                </label>
                <input
                  type='number'
                  className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taxRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  min='0'
                  step='0.01'
                  placeholder='0.00'
                  disabled={!formData.isTaxable || uploading} // Disabled if not taxable or uploading
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  SKU
                </label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-[#356852] focus:border-[#356852] text-sm'
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder='Stock Keeping Unit'
                  disabled={uploading}
                />
              </div>
              <div className='md:col-span-2 flex items-center mt-2'>
                <input
                  type='checkbox'
                  id='isTaxableEdit' // Unique ID for edit modal
                  checked={formData.isTaxable}
                  onChange={(e) =>
                    setFormData({ ...formData, isTaxable: e.target.checked })
                  }
                  className='h-4 w-4 text-[#356852] focus:ring-[#356852] border-gray-300 rounded'
                  disabled={uploading}
                />
                <label
                  htmlFor='isTaxableEdit'
                  className='ml-2 block text-sm text-gray-900'
                >
                  Taxable
                </label>
              </div>
              <div className='md:col-span-2 flex items-center'>
                <input
                  type='checkbox'
                  id='isActiveEdit' // Unique ID for edit modal
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className='h-4 w-4 text-[#356852] focus:ring-[#356852] border-gray-300 rounded'
                  disabled={uploading}
                />
                <label
                  htmlFor='isActiveEdit'
                  className='ml-2 block text-sm text-gray-900'
                >
                  Active Item (Can be used in jobs)
                </label>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
            <div className='flex items-center space-x-3 mb-6'>
              <FileImage className='w-5 h-5 text-[#356852]' />
              <h3 className='font-semibold text-lg text-gray-900'>
                Item Image
              </h3>
            </div>
            <div className='flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50'>
              {imagePreviewUrl ? (
                <div className='relative w-32 h-32 mb-4'>
                  <img
                    src={imagePreviewUrl}
                    alt='Image Preview'
                    className='w-full h-full object-cover rounded-lg'
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreviewUrl(null); // Clear preview
                      setUploadProgress(0);
                      setFormData((prev) => ({ ...prev, imageUrl: '' })); // Clear image URL from form data
                    }}
                    className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors'
                    disabled={uploading}
                    aria-label='Remove image'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <div className='text-center text-gray-500 mb-4'>
                  <UploadCloud className='w-12 h-12 mx-auto text-gray-400' />
                  <p className='mt-2'>No image selected</p>
                </div>
              )}

              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='px-4 py-2 text-sm font-medium text-[#356852] bg-[#e6f4ed] rounded-lg hover:bg-[#d6e9dc] transition-colors flex items-center'
                disabled={uploading}
              >
                <UploadCloud className='w-4 h-4 inline mr-2' />
                {selectedFile || formData.imageUrl
                  ? 'Change Image'
                  : 'Select Image'}
              </button>
              {selectedFile && (
                <div className='mt-4 flex flex-col items-center gap-2 text-sm text-gray-700 w-full max-w-xs'>
                  <span className='font-medium text-center truncate'>
                    {selectedFile.name}
                  </span>
                  {uploading && uploadProgress > 0 && uploadProgress < 100 && (
                    <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2'>
                      <div
                        className='bg-[#356852] h-2.5 rounded-full'
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {uploading &&
                    uploadProgress > 0 && ( // Show percentage only when uploading
                      <span className='text-xs text-gray-600 mt-1'>
                        {Math.round(uploadProgress)}% uploaded
                      </span>
                    )}
                  {!uploading &&
                    uploadProgress === 100 && ( // Show completion only after upload finishes
                      <span className='text-xs text-[#356852] mt-1 flex items-center'>
                        <CheckCircle className='w-3 h-3 mr-1' /> Upload Complete
                      </span>
                    )}
                </div>
              )}
              <input
                type='file'
                ref={fileInputRef}
                accept='image/*'
                className='hidden'
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setSelectedFile(e.target.files[0]);
                    setUploadProgress(0); // Reset progress on new file selection
                  }
                }}
                disabled={uploading}
              />
              <p className='text-xs text-gray-500 mt-3'>
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3 px-8 py-6 bg-white border-t border-gray-200 shadow-sm'>
          <button
            onClick={onClose}
            className='px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            disabled={uploading}
          >
            Cancel
          </button>
          <CustomButton
            title={uploading ? 'Saving Changes...' : 'Save Changes'}
            handleBtnClick={handleUpdateItem}
            isDisabled={uploading}
          />
        </div>
      </div>
    </div>
  );
};

export default EditServiceItemModal;
