import { useRef, useState } from 'react';
import { FileImage, FileText, Package, X } from 'lucide-react';
import CustomButton from '../../CustomElements/CustomButton';
import { TAddServiceItem } from '../../../types/ServiceItem';
import { ServiceItemType } from '../../../constants/Enumeration/ServiceItem/ServiceItem';
import { uploadFile } from '../../../firebase/uploadFile';

interface ICreateServiceItemModal {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  handleSubmit: (data: TAddServiceItem) => void;
}

const CreateServiceItemModal = ({
  isOpen,
  onClose,
  workspaceId,
  handleSubmit,
}: ICreateServiceItemModal) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<TAddServiceItem>({
    workspaceId,
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
  const [uploading, setUploading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.category.trim()) newErrors.category = true;
    if (!formData.unitPrice) newErrors.unitPrice = true;
    if (!formData.cost) newErrors.cost = true;
    return newErrors;
  };

  const handleAddItem = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setUploading(true);
      let imageUrl = '';

      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }

      const payload: TAddServiceItem = {
        ...formData,
        taxRate: formData.taxRate / 100,
        imageUrl,
      };

      //   handleSubmit(payload);
      console.log(payload);

      onClose();
    } catch (error) {
      console.error('Failed to upload or submit item:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
      <div className='w-full max-w-2xl p-6 bg-white rounded-xl shadow-xl overflow-auto max-h-[90vh]'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>
          Create Service Item
        </h2>

        {/* Type Selector */}
        <div className='space-y-3 mb-4'>
          <label className='block text-sm font-medium text-gray-700'>
            Type
          </label>
          <div className='grid grid-cols-2 gap-3'>
            {[ServiceItemType.Service, ServiceItemType.Material].map((type) => (
              <button
                key={type}
                type='button'
                onClick={() => setFormData({ ...formData, type })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.type === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className='flex items-center gap-3'>
                  {type === ServiceItemType.Service ? (
                    <>
                      <FileText className='w-5 h-5' />
                      <span>Service</span>
                    </>
                  ) : (
                    <>
                      <Package className='w-5 h-5' />
                      <span>Material</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='text-sm font-medium'>Name *</label>
            <input
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Category *</label>
            <input
              className={`input ${errors.category ? 'border-red-500' : ''}`}
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Unit Price *</label>
            <input
              type='number'
              className={`input ${errors.unitPrice ? 'border-red-500' : ''}`}
              value={formData.unitPrice}
              onChange={(e) =>
                setFormData({ ...formData, unitPrice: +e.target.value })
              }
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Cost *</label>
            <input
              type='number'
              className={`input ${errors.cost ? 'border-red-500' : ''}`}
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: +e.target.value })
              }
            />
          </div>
          <div>
            <label className='text-sm font-medium'>SKU</label>
            <input
              className='input'
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Tax Rate (%)</label>
            <input
              type='number'
              className='input'
              value={formData.taxRate}
              onChange={(e) =>
                setFormData({ ...formData, taxRate: +e.target.value })
              }
            />
          </div>
        </div>

        <div className='mb-4'>
          <label className='text-sm font-medium'>Description</label>
          <textarea
            className='input resize-none'
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* Checkboxes */}
        <div className='flex items-center gap-6 mb-4'>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={formData.isTaxable}
              onChange={(e) =>
                setFormData({ ...formData, isTaxable: e.target.checked })
              }
            />
            <span className='text-sm'>Taxable</span>
          </label>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
            <span className='text-sm'>Active</span>
          </label>
        </div>

        {/* Image Upload */}
        <div className='mb-6'>
          <label className='block text-sm font-medium mb-1'>Upload Image</label>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className='text-sm text-blue-600 hover:underline'
            >
              <FileImage className='w-4 h-4 inline mr-1' />
              Select Image
            </button>
            {selectedFile && (
              <div className='flex items-center gap-2 text-sm'>
                <span>{selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className='text-red-500 hover:text-red-700'
                >
                  <X className='w-4 h-4' />
                </button>
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
                }
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'
            disabled={uploading}
          >
            Cancel
          </button>
          <CustomButton
            title={uploading ? 'Uploading...' : 'Add Item'}
            handleBtnClick={handleAddItem}
            isDisabled={uploading}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateServiceItemModal;
