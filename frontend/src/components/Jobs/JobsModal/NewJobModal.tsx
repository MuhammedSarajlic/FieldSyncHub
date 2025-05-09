import React, { useState } from 'react';
import { X } from 'lucide-react';

interface INewJobModal {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (jobData: JobData) => void;
}

interface JobData {
  title: string;
  description: string;
  clientId: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  serviceType: string;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'confirmed' | 'in_progress';
  notes: string;
}

const NewJobModal = ({ isOpen, onClose, onSubmit }: INewJobModal) => {
  const [jobData, setJobData] = useState<JobData>({
    title: '',
    description: '',
    clientId: '',
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: 2,
    serviceType: '',
    priority: 'medium',
    status: 'scheduled',
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setJobData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(jobData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setJobData({
      title: '',
      description: '',
      clientId: '',
      scheduledDate: '',
      scheduledTime: '',
      estimatedDuration: 2,
      serviceType: '',
      priority: 'medium',
      status: 'scheduled',
      notes: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center p-4 border-b'>
          <h2 className='text-xl font-semibold text-gray-800'>Add New Job</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Job Title */}
            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Job Title*
              </label>
              <input
                type='text'
                name='title'
                value={jobData.title}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='E.g., AC Repair, Plumbing Installation'
              />
            </div>

            {/* Client Selection */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Client*
              </label>
              <select
                name='clientId'
                value={jobData.clientId}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Select Client</option>
                {/* You would populate this from your client database */}
                <option value='client1'>John Smith</option>
                <option value='client2'>Jane Doe</option>
                <option value='client3'>Acme Corporation</option>
              </select>
            </div>

            {/* Service Type */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Service Type*
              </label>
              <select
                name='serviceType'
                value={jobData.serviceType}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Select Service Type</option>
                <option value='repair'>Repair</option>
                <option value='installation'>Installation</option>
                <option value='maintenance'>Maintenance</option>
                <option value='inspection'>Inspection</option>
                <option value='consultation'>Consultation</option>
              </select>
            </div>

            {/* Scheduled Date */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Date*
              </label>
              <input
                type='date'
                name='scheduledDate'
                value={jobData.scheduledDate}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Scheduled Time */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Time*
              </label>
              <input
                type='time'
                name='scheduledTime'
                value={jobData.scheduledTime}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Estimated Duration */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Est. Duration (hours)
              </label>
              <input
                type='number'
                name='estimatedDuration'
                value={jobData.estimatedDuration}
                onChange={handleChange}
                min='0.5'
                step='0.5'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Priority */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Priority
              </label>
              <select
                name='priority'
                value={jobData.priority}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='low'>Low</option>
                <option value='medium'>Medium</option>
                <option value='high'>High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Status
              </label>
              <select
                name='status'
                value={jobData.status}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='scheduled'>Scheduled</option>
                <option value='confirmed'>Confirmed</option>
                <option value='in_progress'>In Progress</option>
              </select>
            </div>

            {/* Description */}
            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Job Description
              </label>
              <textarea
                name='description'
                value={jobData.description}
                onChange={handleChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Describe the job details, requirements, etc.'
              ></textarea>
            </div>

            {/* Notes */}
            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Additional Notes
              </label>
              <textarea
                name='notes'
                value={jobData.notes}
                onChange={handleChange}
                rows={2}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Any special instructions or notes for the technician'
              ></textarea>
            </div>
          </div>

          <div className='flex justify-end gap-3 mt-6'>
            <button
              type='button'
              onClick={() => {
                resetForm();
                onClose();
              }}
              className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              Save Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewJobModal;
