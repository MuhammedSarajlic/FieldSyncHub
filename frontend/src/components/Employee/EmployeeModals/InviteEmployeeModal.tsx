import { Check, Plus, UserPlus, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { SendInviteBulk } from '../../../services/Invite';
import { useAuth } from '../../../context/AuthProvider';
import { isValidEmail } from '../../../utils/FuntionHelpers/isValidEmail';

interface IInviteEmployeeModal {
  isOpen: boolean;
  setIsInviteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const InviteEmployeeModal = ({
  isOpen,
  setIsInviteModalOpen,
}: IInviteEmployeeModal) => {
  const { user } = useAuth();
  const [emails, setEmails] = useState(['']);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  const handleInvite = async () => {
    if (!user?.workspace) return;
    try {
      const validEmails = emails
        .map((e) => e.trim())
        .filter(Boolean)
        .filter(isValidEmail);

      if (validEmails.length === 0) {
        setSuccess(false);
        return;
      }

      setSending(true);
      setSuccess(null);
      const response = await SendInviteBulk(validEmails, user.workspace.id);
      setSending(false);

      if (response?.status === 200) {
        setSuccess(true);
        setEmails(['']);
      } else {
        setSuccess(false);
      }
    } catch (error) {
      console.log(error);
      setSuccess(false);
      setSending(false);
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    } else {
      setEmails(['']);
    }
  };

  const addEmailField = () => {
    setEmails([...emails, '']);
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
              <p className='text-sm font-normal text-gray-500'>
                Send invitations to new team members.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsInviteModalOpen(false);
              setSuccess(null);
              setEmails(['']);
            }}
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
                <div key={index}>
                  <div className='relative'>
                    <input
                      type='email'
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      placeholder={
                        index === 0 && email === '' ? 'hi@yourcompany.com' : ''
                      }
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 focus:border-transparent text-sm ${
                        email.trim() !== '' && !isValidEmail(email)
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-bg-primary'
                      }`}
                    />
                    {emails.length > 1 && (
                      <button
                        onClick={() => removeEmail(index)}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    )}
                  </div>
                  {email.trim() !== '' && !isValidEmail(email) && (
                    <p className='mt-1 ml-1 text-xs text-red-500'>
                      Please enter a valid email
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addEmailField}
              className='mt-3 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 transition-colors'
            >
              <Plus className='w-4 h-4' />
              Add another
            </button>
          </div>

          {/* Send Invites Button */}
          <button
            onClick={handleInvite}
            disabled={
              sending ||
              emails.every((email) => email.trim() === '') ||
              emails.some(
                (email) => email.trim() !== '' && !isValidEmail(email)
              )
            }
            className={`w-full py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px] ${
              sending ||
              emails.every((email) => email.trim() === '') ||
              emails.some(
                (email) => email.trim() !== '' && !isValidEmail(email)
              )
                ? 'bg-[#e0ece7] text-[#356852] cursor-auto'
                : 'bg-bg-primary text-white hover:bg-bg-primary-hover cursor-pointer'
            }`}
          >
            {sending ? (
              <>
                <div className='relative w-4 h-4'>
                  <Loader2 className='absolute top-0 left-0 w-full h-full animate-spin [animation-duration:2000ms] transform-origin-center' />
                </div>
                <span>Sending...</span>
              </>
            ) : (
              'Send invites'
            )}
          </button>

          {/* Notification */}
          {success === true && (
            <div className='rounded-md bg-green-50 p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <Check className='h-5 w-5 text-green-500' />
                </div>
                <div className='ml-3'>
                  <p className='text-sm font-medium text-green-800'>
                    Invites sent successfully!
                  </p>
                </div>
              </div>
            </div>
          )}
          {success === false && (
            <div className='rounded-md bg-red-50 p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <X className='h-5 w-5 text-red-500' />
                </div>
                <div className='ml-3'>
                  <p className='text-sm font-medium text-red-800'>
                    Failed to send invites. Please check the email addresses.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteEmployeeModal;
