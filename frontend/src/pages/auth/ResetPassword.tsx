import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import images from '../../constants/AssetsConstants/images';
import { ResetPassword as ResetPasswordRequest } from '../../services/Auth';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await ResetPasswordRequest(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'This reset link is invalid or has expired.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Set a new password
            </h2>
            <p className='text-white/90 text-lg'>
              Choose something you haven't used before.
            </p>
          </motion.div>
        </div>
      </div>

      <div className='w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
        <motion.div
          className='w-full max-w-md space-y-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className='text-center lg:hidden mb-8'>
            <img src={images.logo} alt='logo' className='mx-auto h-12 w-auto' />
          </div>

          {isSuccess ? (
            <div className='text-center'>
              <div className='w-16 h-16 mx-auto mb-6 bg-bg-primary/10 rounded-full flex items-center justify-center'>
                <CheckCircle className='text-bg-primary' size={32} />
              </div>
              <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                Password reset
              </h2>
              <p className='mt-3 text-sm text-gray-600'>
                Your password has been changed. You can now sign in with it.
              </p>
              <button
                onClick={() => navigate('/signin')}
                className='mt-8 w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-bg-primary hover:bg-bg-primary-hover shadow-lg shadow-bg-primary/20 transition-all duration-200'
              >
                Go to sign in
              </button>
            </div>
          ) : !token ? (
            <div className='text-center'>
              <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                Invalid reset link
              </h2>
              <p className='mt-3 text-sm text-gray-600'>
                This password reset link is missing its token. Please request
                a new one.
              </p>
              <Link
                to='/forgot-password'
                className='mt-8 inline-flex items-center font-medium text-bg-primary hover:text-bg-primary-hover transition-colors'
              >
                <ArrowLeft className='mr-2' size={16} />
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <div className='text-center'>
                <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                  Choose a new password
                </h2>
                <p className='mt-2 text-sm text-gray-600'>
                  Must be at least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className='mt-8 space-y-5'>
                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    New password
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Lock className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      id='password'
                      type={isPasswordHidden ? 'password' : 'text'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder='••••••••'
                      className='py-3 block w-full pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary sm:text-sm'
                    />
                    <button
                      type='button'
                      onClick={() => setIsPasswordHidden(!isPasswordHidden)}
                      className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500'
                    >
                      {isPasswordHidden ? (
                        <Eye className='h-5 w-5' />
                      ) : (
                        <EyeOff className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor='confirm-password'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Confirm new password
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Lock className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      id='confirm-password'
                      type={isPasswordHidden ? 'password' : 'text'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder='••••••••'
                      className='py-3 block w-full pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary sm:text-sm'
                    />
                  </div>
                </div>

                {error && <p className='text-sm text-red-600'>{error}</p>}

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-bg-primary hover:bg-bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary transition-all duration-200 shadow-lg shadow-bg-primary/20 disabled:opacity-60'
                  >
                    {isSubmitting ? 'Resetting...' : 'Reset password'}
                  </button>
                </motion.div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
