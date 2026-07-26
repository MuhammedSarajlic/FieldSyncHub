import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import images from '../../constants/AssetsConstants/images';
import { Login, GoogleLogin } from '../../services/Auth';
import { useAuth } from '../../context/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { TUserLogin } from '../../types/User';
import GoogleAuthButton from '../../components/CustomElements/GoogleAuthButton';

const slides = [
  {
    title: 'Welcome Back',
    description:
      'Streamline your workflow and boost productivity with our powerful platform designed for modern teams.',
    cta: 'Get started today',
  },
  {
    title: 'Seamless Integration',
    description:
      'Connect with your favorite tools and services to create a unified workspace experience.',
    cta: 'Explore integrations',
  },
  {
    title: 'Enterprise Grade Security',
    description:
      'Your data is protected with industry-leading security measures and encryption protocols.',
    cta: 'Learn about security',
  },
];

const isGoogleAuthEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

const Signin = () => {
  const navigate = useNavigate();
  const { user, loading, setAccessToken } = useAuth();
  const [isPasswordHidden, setIsPasswordHidden] = useState(false);
  const [userLoginData, setUserLoginData] = useState<TUserLogin>({
    email: '',
    password: '',
  });
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const showPassword = () => {
    setIsPasswordHidden(!isPasswordHidden);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await Login(userLoginData);
    if (response.status === 200) {
      const token = response.data.accessToken;
      localStorage.setItem('accessToken', token);
      setAccessToken(token);
    }
  };

  const handleGoogleCredential = async (idToken: string) => {
    try {
      const response = await GoogleLogin(idToken);
      if (response.status === 200) {
        const token = response.data.accessToken;
        localStorage.setItem('accessToken', token);
        setAccessToken(token);
      }
    } catch (error) {
      console.error('Google sign-in failed', error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading]);

  return (
    <div className='w-full h-screen flex bg-gray-50 font-sans'>
      {/* Left decorative panel with slideshow */}
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
          </motion.div>

          <div className='relative h-64 overflow-hidden'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className='absolute inset-0'
              >
                <h2 className='text-4xl font-bold text-white mb-6'>
                  {slides[currentSlide].title}
                </h2>
                <p className='text-white/90 text-lg mb-8'>
                  {slides[currentSlide].description}
                </p>
                <button className='px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20 hover:bg-white/20 transition-colors duration-300'>
                  {slides[currentSlide].cta}
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className='flex justify-center space-x-3 mt-8'>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white w-6' : 'bg-white/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Animated decorative elements */}
        <motion.div
          className='absolute top-0 left-0 w-full h-full'
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 20%)',
              'radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 20%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Right form panel */}
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

          <div className='text-center'>
            <motion.h2
              className='text-3xl font-extrabold text-gray-900 tracking-tight'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Sign in to your Account
            </motion.h2>
            <motion.p
              className='mt-2 text-sm text-gray-600'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Welcome back! Please enter your details.
            </motion.p>
            {/* <motion.p
              className='mt-2 text-sm text-gray-600'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Don't have an account?{' '}
              <Link
                to='/signup'
                className='font-medium text-bg-primary hover:text-bg-primary-hover transition-colors'
              >
                Get started
              </Link>
            </motion.p> */}
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className='mt-8 space-y-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className=' space-y-5'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Email address
                </label>
                <div
                  className={`relative transition-all duration-200 ${
                    isFocused.email ? 'ring-2 ring-bg-primary/50' : ''
                  } rounded-md`}
                >
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg
                      className='h-5 w-5 text-gray-400'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                      <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                    </svg>
                  </div>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={userLoginData.email}
                    onChange={(e) =>
                      setUserLoginData({
                        ...userLoginData,
                        email: e.target.value,
                      })
                    }
                    onFocus={() => setIsFocused({ ...isFocused, email: true })}
                    onBlur={() => setIsFocused({ ...isFocused, email: false })}
                    placeholder='you@example.com'
                    className='py-3 block w-full pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary sm:text-sm'
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Password
                </label>
                <div
                  className={`relative transition-all duration-200 ${
                    isFocused.password ? 'ring-2 ring-bg-primary/50' : ''
                  } rounded-md`}
                >
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg
                      className='h-5 w-5 text-gray-400'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <input
                    id='password'
                    name='password'
                    type={isPasswordHidden ? 'text' : 'password'}
                    autoComplete='current-password'
                    required
                    value={userLoginData.password}
                    onChange={(e) =>
                      setUserLoginData({
                        ...userLoginData,
                        password: e.target.value,
                      })
                    }
                    onFocus={() =>
                      setIsFocused({ ...isFocused, password: true })
                    }
                    onBlur={() =>
                      setIsFocused({ ...isFocused, password: false })
                    }
                    placeholder='••••••••'
                    className='py-3 block w-full pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary sm:text-sm'
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <button
                      type='button'
                      onClick={showPassword}
                      className='text-gray-400 hover:text-gray-500 focus:outline-none'
                    >
                      {isPasswordHidden ? (
                        <svg
                          className='h-5 w-5'
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
                          <path
                            fillRule='evenodd'
                            d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      ) : (
                        <svg
                          className='h-5 w-5'
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 20 20'
                          fill='currentColor'
                        >
                          <path
                            fillRule='evenodd'
                            d='M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z'
                            clipRule='evenodd'
                          />
                          <path d='M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z' />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className='mt-2 flex items-center justify-between'>
                  <div className='flex items-center'>
                    <input
                      id='remember-me'
                      name='remember-me'
                      type='checkbox'
                      className='h-4 w-4 text-bg-primary focus:ring-bg-primary border-gray-300 rounded'
                    />
                    <label
                      htmlFor='remember-me'
                      className='ml-2 block text-sm text-gray-900'
                    >
                      Remember me for 30 days
                    </label>
                  </div>
                  <div className='text-right'>
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-bg-primary hover:text-bg-primary-hover transition-colors'
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <button
                type='submit'
                className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-bg-primary hover:bg-bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary transition-all duration-200 shadow-lg shadow-bg-primary/20'
              >
                {/* <span className='absolute left-0 inset-y-0 flex items-center pl-3'>
                  <svg
                    className='h-5 w-5 text-white/80 group-hover:text-white transition-colors duration-200'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </span> */}
                Sign in
              </button>
            </motion.div>
          </motion.form>

          <motion.div
            className='mt-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isGoogleAuthEnabled && (
              <>
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-gray-300'></div>
                  </div>
                  <div className='relative flex justify-center text-sm'>
                    <span className='px-2 bg-gray-50 text-gray-500'>
                      Or sign in with
                    </span>
                  </div>
                </div>

                <div className='mt-6'>
                  <GoogleAuthButton
                    onCredential={handleGoogleCredential}
                    text='signin_with'
                  />
                </div>
              </>
            )}
            <div className='pt-2 text-center'>
              <motion.p
                className='mt-2 text-sm text-gray-600'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Don't have an account?{' '}
                <Link
                  to='/signup'
                  className='font-medium text-bg-primary hover:text-bg-primary-hover transition-colors'
                >
                  Get started
                </Link>
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signin;
