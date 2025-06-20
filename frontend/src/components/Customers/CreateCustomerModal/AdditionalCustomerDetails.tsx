import { useEffect, useState } from 'react';
import NewCustomFieldModal from '../../CustomField/NewCustomFieldModal';
import CustomSmallButton from '../../CustomElements/CustomSmallButton';
import { TAddCustomer } from '../../../types/Customer';
import { TCustomField } from '../../../types/CustomField';
import { GetCustomFieldsByWorkspace } from '../../../services/CustomField';
import { useAuth } from '../../../context/AuthProvider';
import { CustomFieldType } from '../../../constants/Enumeration/CustomFieldEnum/CustomFieldEnum';
import { Loader2 } from 'lucide-react';

interface IAdditionalCustomerDetails {
  customer: TAddCustomer;
  setCustomer: React.Dispatch<React.SetStateAction<TAddCustomer>>;
}

const AdditionalCustomerDetails = ({
  customer,
  setCustomer,
}: IAdditionalCustomerDetails) => {
  const { user } = useAuth();
  const [isCreateCustomFieldModalOpen, setIsCreateCustomFieldModalOpen] =
    useState(false);
  const [customFields, setCustomFields] = useState<TCustomField[]>([]);

  const fetchCustomFields = async () => {
    if (!user?.workspace?.id) return;
    const response = await GetCustomFieldsByWorkspace(user.workspace.id);

    if (response.status === 200) {
      const fields: TCustomField[] = response.data.payload;
      setCustomFields(fields);

      setCustomer((prev) => {
        const existing = prev.customFieldValues ?? [];

        const updatedValues = [...existing];

        for (const field of fields) {
          const alreadyExists = updatedValues.some(
            (v) => v.customFieldId === field.id
          );
          const hasDefault =
            field.defaultValue !== undefined &&
            field.defaultValue !== null &&
            field.defaultValue !== '';

          if (!alreadyExists && hasDefault) {
            updatedValues.push({
              customFieldId: field.id,
              value: field.defaultValue!,
            });
          }
        }

        return { ...prev, customFieldValues: updatedValues };
      });
    }
  };

  const handleCustomFieldChange = (
    customFieldId: string,
    value: string | boolean
  ) => {
    setCustomer((prev) => {
      const updatedValues =
        prev.customFieldValues?.filter((f) => f.value !== '') || [];

      const valueStr = value.toString();
      const index = updatedValues.findIndex(
        (v) => v.customFieldId === customFieldId
      );

      if (valueStr.trim() === '') {
        // Remove empty fields
        if (index > -1) updatedValues.splice(index, 1);
      } else {
        if (index > -1) {
          updatedValues[index].value = valueStr;
        } else {
          updatedValues.push({
            customFieldId,
            value: valueStr,
          });
        }
      }

      return { ...prev, customFieldValues: updatedValues };
    });
  };

  const getCustomFieldValue = (field: TCustomField): string | boolean => {
    const userValue = customer.customFieldValues?.find(
      (val) => val.customFieldId === field.id
    )?.value;

    return userValue ?? field.defaultValue ?? '';
  };

  useEffect(() => {
    fetchCustomFields();
  }, []);

  if (!user)
    return (
      <div>
        <Loader2 />
      </div>
    );

  return (
    <>
      <div className='space-y-2'>
        <div className='py-1 px-2 flex items-center justify-between bg-[#FAFAFA] rounded-md'>
          <p className='font-medium text-lg'>Additional customer details</p>
        </div>
        <div className='px-2 pt-2 space-y-3'>
          {customFields.map((field) => (
            <div key={field.id} className='w-full flex items-center space-x-4'>
              {/* Field name */}
              <p className='w-1/2 text-primary text-sm'>{field.fieldName}</p>

              {/* Input */}
              {field.fieldType === CustomFieldType.Checkbox ? (
                <input
                  type='checkbox'
                  className='w-5 h-5 accent-[#356852]'
                  checked={getCustomFieldValue(field) === 'true'}
                  onChange={(e) =>
                    handleCustomFieldChange(field.id, e.target.checked)
                  }
                />
              ) : field.fieldType === CustomFieldType.Dropdown ? (
                <select
                  className='text-sm w-full border border-border-primary rounded-lg px-3 py-2 text-heading outline-none focus:border-[#356852]'
                  value={getCustomFieldValue(field)}
                  onChange={(e) =>
                    handleCustomFieldChange(field.id, e.target.value)
                  }
                >
                  {!field.defaultValue && (
                    <option value=''>-- Select --</option>
                  )}
                  {field.dropdownOptions?.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={CustomFieldType[field.fieldType].toLowerCase()} // like "text", "number", "date"
                  className='text-sm w-full border border-border-primary rounded-lg px-3 py-2 text-heading outline-none focus:border-[#356852]'
                  value={getCustomFieldValue(field)}
                  onChange={(e) =>
                    handleCustomFieldChange(field.id, e.target.value)
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className='mt-4 px-2'>
          <CustomSmallButton
            title='Add Custom Field'
            handleClick={() => setIsCreateCustomFieldModalOpen(true)}
          />
        </div>
      </div>

      {isCreateCustomFieldModalOpen && (
        <NewCustomFieldModal
          setIsCreateCustomFieldModalOpen={setIsCreateCustomFieldModalOpen}
          workspaceId={user.workspace?.id}
          setCustomFields={setCustomFields}
          setCustomer={setCustomer}
        />
      )}
    </>
  );
};

export default AdditionalCustomerDetails;
