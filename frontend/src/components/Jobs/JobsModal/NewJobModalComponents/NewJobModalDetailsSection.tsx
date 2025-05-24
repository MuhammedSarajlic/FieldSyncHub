import { TCustomer } from '../../../../types/Customer';
import { TAddJob } from '../../../../types/Job';
import { TProperty } from '../../../../types/Property';

interface INewJobModalDetailsSection {
  newJob: TAddJob;
  setNewJob: React.Dispatch<React.SetStateAction<TAddJob>>;
  selectedCustomer: TCustomer | undefined;
  selectedProperty: TProperty | undefined;
}
const NewJobModalDetailsSection = ({
  newJob,
  setNewJob,
  selectedCustomer,
  selectedProperty,
}: INewJobModalDetailsSection) => {
  const handlePropertySelect = (property: TProperty) => {
    setNewJob((prev) => ({ ...prev, property }));
  };
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium text-gray-900'>Job Details</h3>
        <p className='text-sm text-gray-500'>
          Add title and description for this job
        </p>
      </div>

      {selectedCustomer ? (
        <>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h4 className='font-medium'>
              {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </h4>
            <div className='grid grid-cols-2 gap-4 mt-2'>
              <div>
                <p className='text-sm text-gray-700'>
                  {selectedCustomer?.customerPhones[0]?.phoneNumber}
                </p>
                <p className='text-sm text-gray-700'>
                  {selectedCustomer?.email[0]}
                </p>
              </div>
              <div>
                <select
                  value={selectedProperty?.id || ''}
                  onChange={(e) => {
                    const property = selectedCustomer?.properties.find(
                      (p) => p.id === e.target.value
                    );
                    if (property) handlePropertySelect(property);
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                >
                  {selectedCustomer?.properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.street}, {property.city}, {property.state}{' '}
                      {property.postalCode}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className='mt-4 space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Job Title
              </label>
              <input
                type='text'
                value={newJob.title}
                onChange={(e) =>
                  setNewJob((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                placeholder='Enter job title'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description
              </label>
              <textarea
                value={newJob.description}
                onChange={(e) =>
                  setNewJob((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                rows={3}
                placeholder='Enter job description'
              />
            </div>
          </div>
        </>
      ) : (
        <div className='text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg'>
          Please select a customer first to add job details
        </div>
      )}
    </div>
  );
};

export default NewJobModalDetailsSection;
