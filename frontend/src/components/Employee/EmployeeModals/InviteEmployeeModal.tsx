import { Check, Copy, Plus, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { SendInvite } from '../../../services/Invite';
import { useAuth } from '../../../context/AuthProvider';

interface IInviteEmployeeModal {
  isOpen: boolean;
  onClose: () => void;
}

const InviteEmployeeModal = ({ isOpen, onClose }: IInviteEmployeeModal) => {
  const { user } = useAuth();
  const [emails, setEmails] = useState(['']);
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState('Technician');
  const [department, setDepartment] = useState('Field Service');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const magicLink = 'http://localhost.com/invite/87689';

  const handleInvite = async () => {
    setSending(true);
    const response = await SendInvite(emails[0], user?.workspace.id as string);
    if (response.status === 200) {
      setSending(false);
      setSuccess(true);
      onClose();
    }
    console.log(response);
  };

  const updateEmail = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const removeEmail = (index) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(magicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center'>
              <UserPlus className='w-4 h-4 text-gray-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Invite team members
              </h2>
              <p className='text-sm text-gray-500'>
                Invite teammates to earn free components.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Email Invites Section */}
          <div>
            <h3 className='text-sm font-medium text-gray-900 mb-4'>
              Invite via email
            </h3>
            <div className='space-y-3'>
              {emails.map((email, index) => (
                <div key={index} className='relative'>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder={
                      index === emails.length - 1 && email === ''
                        ? 'hi@yourcompany.com'
                        : ''
                    }
                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
                  />
                  {emails.length > 1 && email === '' && (
                    <button
                      onClick={() => removeEmail(index)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              // onClick={addEmailField}
              className='mt-3 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 transition-colors'
            >
              <Plus className='w-4 h-4' />
              Add another
            </button>
          </div>

          {/* Send Invites Button */}
          <button
            onClick={handleInvite}
            className='w-full bg-bg-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-bg-primary-hover transition-colors cursor-pointer'
          >
            Send invites
          </button>

          {/* Magic Link Section */}
          <div>
            <h3 className='text-sm font-medium text-gray-900 mb-4'>
              Invite via magic link
            </h3>
            <div className='relative'>
              <input
                type='text'
                value={magicLink}
                readOnly
                className='w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-600'
              />
              <button
                onClick={copyToClipboard}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
              >
                {copied ? (
                  <Check className='w-4 h-4 text-green-500' />
                ) : (
                  <Copy className='w-4 h-4' />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteEmployeeModal;
