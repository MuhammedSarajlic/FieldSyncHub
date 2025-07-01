import { ChangeEvent, useEffect, useState } from 'react';
import { Loader2, Lock, Mail, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import images from '../constants/AssetsConstants/images';
import { AcceptInvite, ValidateInviteToken } from '../services/Invite';
import { TEmployeeInvite } from '../types/EmployeeInvite';
import { useAuth } from '../context/AuthProvider';

const InviteJoin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAccessToken, user, loading } = useAuth();

  const [loadingToken, setLoadingToken] = useState(true);
  const [invite, setInvite] = useState<TEmployeeInvite>();
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [isPasswordHidden, setIsPasswordHidden] = useState(false);
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(false);

  const getTokenFromURL = (): string | null => {
    const rawSearch = window.location.search;
    const match = rawSearch.match(/[?&]token=([^&]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const token = getTokenFromURL();

    const validateInviteToken = async () => {
      try {
        const response = await ValidateInviteToken(
          encodeURIComponent(token as string)
        );
        console.log(response);
        setInvite(response.data);
      } catch (err) {
        console.log(err);
        setError('This invite is invalid or has expired.');
      } finally {
        setLoadingToken(false);
      }
    };

    if (token) validateInviteToken();
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(userData);

    if (userData.password !== userData.confirmPassword) {
      return setError("Passwords don't match");
    }

    try {
      const token = getTokenFromURL();
      const updatedUserData = {
        ...userData,
        email: invite.email,
      };
      const response = await AcceptInvite(
        encodeURIComponent(token as string),
        updatedUserData
      );
      if (response.status === 200) {
        const token = response.data.accessToken;
        localStorage.setItem('accessToken', token);
        setAccessToken(token);
      }
      console.log(response);

      // navigate('/login');
    } catch (err) {
      console.log(err);
      setError(err.response?.data || 'Something went wrong.');
    }
  };

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading]);

  //   if (loading) {
  //     return (
  //       <div className='flex items-center justify-center min-h-screen bg-gray-100'>
  //         <Loader2 className='animate-spin w-6 h-6 text-gray-600' />
  //       </div>
  //     );
  //   }

  //   if (error) {
  //     return (
  //       <div className='flex items-center justify-center min-h-screen bg-gray-50'>
  //         <div className='bg-white p-6 rounded-lg shadow-lg max-w-md text-center'>
  //           <p className='text-lg font-semibold text-red-600 mb-2'>
  //             Invite Error
  //           </p>
  //           <p className='text-sm text-gray-600'>{error}</p>
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <div className='w-full h-screen flex bg-gray-50 font-sans'>
      {/* Left decorative panel */}
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

          <div className='relative h-64'>
            <h2 className='text-4xl font-bold text-white mb-6'>
              Welcome to the Team!
            </h2>
            <p className='text-white/90 text-lg mb-8'>
              You're joining {invite?.workspace?.name ?? 'XYZ workspace'} as a{' '}
              <span className='font-medium'>{invite?.role ?? 'ROLE'}</span>.
              Complete your registration to get started.
            </p>
            <button className='px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20 hover:bg-white/20 transition-colors duration-300'>
              Learn about your role
            </button>
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
              Complete Your Registration
            </motion.h2>
            <motion.p
              className='mt-2 text-sm text-gray-600'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              You're joining{' '}
              <span className='font-medium text-bg-primary'>
                {invite?.workspace?.name ?? 'XYZ workspace'}
              </span>{' '}
              as a <span className='font-medium'>{invite?.role ?? 'ROLE'}</span>
            </motion.p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className='mt-8 space-y-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email
                </label>
                <div className='relative rounded-md'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='h-5 w-5 text-gray-400' size={16} />
                  </div>
                  <input
                    type='email'
                    value={invite?.email ?? 'test@gmail.com'}
                    disabled
                    className='w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    First Name
                  </label>
                  <div className='relative rounded-md'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <User className='h-5 w-5 text-gray-400' size={16} />
                    </div>
                    <input
                      name='firstName'
                      required
                      value={userData.firstName}
                      onChange={handleChange}
                      placeholder='John'
                      className='w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Last Name
                  </label>
                  <div className='relative rounded-md'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <User className='h-5 w-5 text-gray-400' size={16} />
                    </div>
                    <input
                      name='lastName'
                      required
                      value={userData.lastName}
                      onChange={handleChange}
                      placeholder='Doe'
                      className='w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary'
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Password
                </label>
                <div className='relative rounded-md'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' size={16} />
                  </div>
                  <input
                    type={isPasswordHidden ? 'text' : 'password'}
                    name='password'
                    required
                    value={userData.password}
                    onChange={handleChange}
                    placeholder='••••••••'
                    className='w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary'
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <button
                      type='button'
                      onClick={() => setIsPasswordHidden(!isPasswordHidden)}
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
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Confirm Password
                </label>
                <div className='relative rounded-md'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' size={16} />
                  </div>
                  <input
                    type={isConfirmPasswordHidden ? 'text' : 'password'}
                    name='confirmPassword'
                    required
                    value={userData.confirmPassword}
                    onChange={handleChange}
                    placeholder='••••••••'
                    className='w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary'
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <button
                      type='button'
                      onClick={() =>
                        setIsConfirmPasswordHidden(!isConfirmPasswordHidden)
                      }
                      className='text-gray-400 hover:text-gray-500 focus:outline-none'
                    >
                      {isConfirmPasswordHidden ? (
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
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='text-sm text-red-600 text-center'
              >
                {error}
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <button
                type='submit'
                className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-bg-primary hover:bg-bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bg-primary transition-all duration-200 shadow-lg shadow-bg-primary/20'
              >
                Join Workspace
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default InviteJoin;
