import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import images from '../../constants/AssetsConstants/images';
import { ConfirmEmailChange as ConfirmEmailChangeRequest } from '../../services/User';

const ConfirmEmailChange = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>(
    'pending'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('This confirmation link is missing its token.');
      return;
    }

    const confirm = async () => {
      try {
        await ConfirmEmailChangeRequest(token);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setError(
          err?.response?.data?.message ||
            'This confirmation link is invalid or has expired.'
        );
      }
    };
    confirm();
  }, [token]);

  return (
    <div className='w-full h-screen flex bg-gray-50 font-sans'>
      <div className='hidden lg:flex w-1/2 bg-bg-primary items-center justify-center relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-bg-primary/90 to-emerald-800/90'></div>
        <div className='relative z-10 px-20 w-full max-w-2xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={images.logo}
              alt='logo'
              className='max-w-[220px] mb-8 filter brightness-0 invert'
            />
            <h2 className='text-4xl font-bold text-white mb-6'>
              Confirming your email
            </h2>
            <p className='text-white/90 text-lg'>
              Just a moment while we verify your new address.
            </p>
          </motion.div>
        </div>
      </div>

      <div className='w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
        <motion.div
          className='w-full max-w-md space-y-8 text-center'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className='text-center lg:hidden mb-8'>
            <img src={images.logo} alt='logo' className='mx-auto h-12 w-auto' />
          </div>

          {status === 'pending' && (
            <>
              <Loader2 className='mx-auto animate-spin text-bg-primary' size={40} />
              <h2 className='text-2xl font-extrabold text-gray-900 tracking-tight'>
                Confirming your email address...
              </h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className='w-16 h-16 mx-auto mb-6 bg-bg-primary/10 rounded-full flex items-center justify-center'>
                <CheckCircle className='text-bg-primary' size={32} />
              </div>
              <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                Email updated
              </h2>
              <p className='mt-3 text-sm text-gray-600'>
                Your account's email address has been changed. Sign in again
                if you're asked to.
              </p>
              <button
                onClick={() => navigate('/')}
                className='mt-8 w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-bg-primary hover:bg-bg-primary-hover shadow-lg shadow-bg-primary/20 transition-all duration-200'
              >
                Continue
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className='w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center'>
                <XCircle className='text-red-600' size={32} />
              </div>
              <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                Confirmation failed
              </h2>
              <p className='mt-3 text-sm text-gray-600'>{error}</p>
              <Link
                to='/settings'
                className='mt-8 inline-flex items-center font-medium text-bg-primary hover:text-bg-primary-hover transition-colors'
              >
                Back to settings
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmEmailChange;
