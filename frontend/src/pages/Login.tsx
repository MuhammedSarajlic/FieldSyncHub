import { useState } from 'react';
import icons from '../constants/icons';

const Login = () => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(false);

  const showPassword = () => {
    setIsPasswordHidden(!isPasswordHidden);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className='w-full h-screen flex'>
      <div className='w-1/2 flex flex-col items-center justify-center border-1 border-black'>
        <div className='space-y-8 w-1/2'>
          <div className='text-blue-600 font-bold text-xl'>FieldSyncHub</div>
          <div className='space-y-3'>
            <p className='font-bold text-3xl text-[#212529]'>
              Log in to your Account
            </p>
            <p className='text-[#343a40]'>
              Welcome back! Select method to log in
            </p>
          </div>
          <form onSubmit={handleSubmit} className='flex flex-col space-y-4'>
            <div className='flex items-center space-x-3 border-[1px] border-[#ced4da] rounded-lg py-2 px-3'>
              <img src={icons.mailIcon} alt='mail' className='w-5' />
              <input
                type='email'
                placeholder='Email'
                className='w-full outline-none text-[#212529]'
              />
            </div>
            <div className='flex items-center justify-between space-x-3 border-[1px] border-[#ced4da] rounded-lg py-2 px-3'>
              <img src={icons.passwordIcon} alt='mail' className='w-5' />
              <input
                type={isPasswordHidden ? 'text' : 'password'}
                placeholder='Password'
                className='flex-1 outline-none'
              />
              <button onClick={showPassword} className='cursor-pointer'>
                <img
                  src={isPasswordHidden ? icons.showIcon : icons.hideIcon}
                  alt='hide'
                  className='w-5 h-5'
                />
              </button>
            </div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <input type='checkbox' className='w-4 h-4 cursor-pointer' />
                <p className='text-[#495057]'>Remember me</p>
              </div>
              <p className='text-blue-600 font-medium text-sm cursor-pointer'>
                Forgot password?
              </p>
            </div>
            <button
              type='submit'
              className='w-full mt-4 bg-blue-600 text-white py-2 rounded-lg cursor-pointer font-medium'
            >
              Log in
            </button>
          </form>
          <div className='flex items-center space-x-3'>
            <div className='w-1/2 bg-[#ced4da] h-[1px]'></div>
            <div className='text-[#adb5bd]'>or</div>
            <div className='w-1/2 bg-[#ced4da] h-[1px]'></div>
          </div>
          <div className='flex items-center justify-center space-x-3 border-[1px] border-[#ced4da] rounded-lg py-2 cursor-pointer'>
            <img src={icons.googleIcon} alt='google' className='w-4 h-4' />
            <p className='font-medium'>Login with Google</p>
          </div>
          <div className='text-center'>
            <p className='text-[#6c757d] text-sm font-medium'>
              Don't have an account?{' '}
              <span className='text-blue-600 cursor-pointer'>
                Create an account
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className='w-1/2 bg-blue-600'>slika</div>
    </div>
  );
};

export default Login;
