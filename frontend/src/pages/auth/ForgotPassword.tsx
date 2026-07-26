import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import images from '../../constants/AssetsConstants/images';
import { ForgotPassword as ForgotPasswordRequest } from '../../services/Auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ForgotPasswordRequest(email);
    } finally {
      // Always show the same success state, whether or not the email is
      // registered - avoids revealing which emails have accounts.
      setIsSubmitting(false);
      setIsSubmitted(true);
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
              Forgot your password?
            </h2>
            <p className='text-white/90 text-lg'>
              No problem. We'll email you a link to set a new one.
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

          {isSubmitted ? (
            <div className='text-center'>
              <div className='w-16 h-16 mx-auto mb-6 bg-bg-primary/10 rounded-full flex items-center justify-center'>
                <CheckCircle className='text-bg-primary' size={32} />
              </div>
              <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                Check your email
              </h2>
              <p className='mt-3 text-sm text-gray-600'>
                If an account exists for <strong>{email}</strong>, we've sent
                a link to reset your password. It expires in 1 hour.
              </p>
              <Link
                to='/signin'
                className='mt-8 inline-flex items-center font-medium text-bg-primary hover:text-bg-primary-hover transition-colors'
              >
                <ArrowLeft className='mr-2' size={16} />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className='text-center'>
                <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                  Reset your password
                </h2>
                <p className='mt-2 text-sm text-gray-600'>
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Email address
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Mail className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      id='email'
                      type='email'
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='you@example.com'
                      className='py-3 block w-full pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary sm:text-sm'
                    />
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-bg-primary hover:bg-bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary transition-all duration-200 shadow-lg shadow-bg-primary/20 disabled:opacity-60'
                  >
                    {isSubmitting ? 'Sending...' : 'Send reset link'}
                  </button>
                </motion.div>

                <div className='text-center text-sm'>
                  <Link
                    to='/signin'
                    className='inline-flex items-center font-medium text-bg-primary hover:text-bg-primary-hover transition-colors'
                  >
                    <ArrowLeft className='mr-2' size={16} />
                    Back to sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
