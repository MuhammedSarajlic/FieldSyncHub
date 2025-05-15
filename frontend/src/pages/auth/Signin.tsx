import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import icons from '../../constants/icons';
import images from '../../constants/images';
import { Login } from '../../services/Auth';
import { useAuth } from '../../context/AuthProvider';

const Signin = () => {
  const navigate = useNavigate();
  const { user, loading, setAccessToken } = useAuth();
  const [isPasswordHidden, setIsPasswordHidden] = useState(false);
  const [userLoginData, setUserLoginData] = useState({
    email: '',
    password: '',
  });

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

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading]);

  return (
    <div className='w-full h-screen flex'>
      <div className='w-1/2 bg-bg-primary'></div>

      <div className='w-1/2 flex flex-col items-center justify-center'>
        <div className='space-y-8 w-1/2'>
          {/* <div className='text-blue-600 font-bold text-xl'>FieldSyncHub</div> */}
          <div>
            <img src={images.logo} alt='logo' className='max-w-[200px]' />
          </div>
          <div className='space-y-3'>
            <p className='font-bold text-3xl text-heading'>
              Sign in to your Account
            </p>
            <p className='text-[#6c757d]'>
              Welcome back! Please enter your details.
            </p>
          </div>
          <form onSubmit={handleSubmit} className='flex flex-col space-y-4'>
            <div className='flex items-center space-x-3 border-[1px] border-[#ced4da] rounded-lg py-2 px-3'>
              <img src={icons.mailIcon} alt='mail' className='w-5' />
              <input
                required
                type='email'
                value={userLoginData.email}
                onChange={(e) =>
                  setUserLoginData({ ...userLoginData, email: e.target.value })
                }
                placeholder='Email'
                className='w-full outline-none text-[#212529]'
              />
            </div>
            <div className='flex items-center justify-between space-x-3 border-[1px] border-[#ced4da] rounded-lg py-2 px-3'>
              <img src={icons.passwordIcon} alt='mail' className='w-5' />
              <input
                required
                type={isPasswordHidden ? 'text' : 'password'}
                placeholder='Password'
                value={userLoginData.password}
                onChange={(e) =>
                  setUserLoginData({
                    ...userLoginData,
                    password: e.target.value,
                  })
                }
                className='flex-1 outline-none'
              />
              <div onClick={showPassword} className='cursor-pointer'>
                <img
                  src={isPasswordHidden ? icons.showIcon : icons.hideIcon}
                  alt='hide'
                  className='w-5 h-5'
                />
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <input type='checkbox' className='w-3.5 h-3.5 cursor-pointer' />
                <p className='text-sm font-medium text-heading'>Remember me</p>
              </div>
              <p className='text-text-secondary font-medium text-sm cursor-pointer'>
                Forgot password?
              </p>
            </div>
            <button
              type='submit'
              className='w-full mt-4 bg-bg-primary text-white py-2 rounded-lg cursor-pointer font-medium hover:bg-bg-primary-hover transition-colors duration-200'
            >
              Sign in
            </button>
          </form>
          <div className='flex items-center space-x-3'>
            <div className='w-1/2 bg-[#ced4da] h-[1px]'></div>
            <div className='text-[#adb5bd]'>or</div>
            <div className='w-1/2 bg-[#ced4da] h-[1px]'></div>
          </div>
          <div className='flex items-center justify-center space-x-3 border-[1px] border-[#ced4da] rounded-lg py-2 cursor-pointer'>
            <img src={icons.googleIcon} alt='google' className='w-4 h-4' />
            <p className='font-medium'>Sign in with Google</p>
          </div>
          <div className='text-center'>
            <p className='text-[#6c757d] text-sm font-medium'>
              Don't have an account?{' '}
              <Link to='/signup' className='text-text-secondary cursor-pointer'>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
