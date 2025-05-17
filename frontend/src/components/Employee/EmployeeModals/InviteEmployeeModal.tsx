import { X } from 'lucide-react';
import { useState } from 'react';

const InviteEmployeeModal = ({ isOpen, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Technician');
  const [department, setDepartment] = useState('Field Service');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInvite = async () => {
    setSending(true);
    await onInvite({ email, role, department });
    setSending(false);
    setSuccess(true);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4'>
      <div className='bg-white w-full max-w-md rounded-xl shadow-lg'>
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <h2 className='text-lg font-bold text-gray-800'>Invite Employee</h2>
          <button onClick={onClose}>
            <X className='text-gray-500 hover:text-gray-700' />
          </button>
        </div>

        <div className='p-6'>
          {success ? (
            <div className='text-green-600 font-medium'>
              ✅ Invite sent successfully!
            </div>
          ) : (
            <>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Employee Email
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='jane.doe@example.com'
                />
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Role / Position
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option>Technician</option>
                  <option>Dispatcher</option>
                  <option>Manager</option>
                </select>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option>Field Service</option>
                  <option>Office</option>
                  <option>Dispatch</option>
                </select>
              </div>

              <button
                onClick={handleInvite}
                disabled={sending || !email}
                className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50'
              >
                {sending ? 'Sending...' : 'Send Invite'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteEmployeeModal;
