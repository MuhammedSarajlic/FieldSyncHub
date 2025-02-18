import { useState } from 'react';
import icons from '../constants/icons';
import { Link } from 'react-router';

const Signup = () => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(false);

  const showPassword = () => {
    setIsPasswordHidden(!isPasswordHidden);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <div className='w-full h-screen flex'>
      <div className='w-1/2 bg-blue-600'>slika</div>

      <div className='w-1/2 flex flex-col items-center justify-center'>
        <div className='space-y-8 w-1/2'>
          <div className='text-blue-600 font-bold text-xl'>FieldSyncHub</div>
          <div className='space-y-3'>
            <p className='font-bold text-3xl text-[#212529]'>
              Create your account
            </p>
            <p className='text-[#6c757d]'>
              Let's get started with your 30 days free trial
            </p>
          </div>
          <form onSubmit={handleSubmit} className='flex flex-col space-y-4'>
            <div className='flex items-center space-x-4'>
              <div className='w-1/2 flex items-center space-x-3 border-[1px] border-[#ced4da] rounded-lg py-2 px-3'>
                <img src={icons.idCardIcon} alt='mail' className='w-5' />
                <input
                  type='text'
                  placeholder='First Name'
                  className='w-full outline-none text-[#212529]'
                />
              </div>
              <div className='w-1/2 flex items-center space-x-3 border-[1px] border-[#ced4da] rounded-lg py-2 px-3'>
                <img src={icons.idCardIcon} alt='mail' className='w-5' />
                <input
                  type='text'
                  placeholder='Last Name'
                  className='w-full outline-none text-[#212529]'
                />
              </div>
            </div>
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
            <button
              type='submit'
              className='w-full mt-4 bg-blue-600 text-white py-2 rounded-lg cursor-pointer font-medium'
            >
              Sign up
            </button>
          </form>
          <div className='flex items-center space-x-3'>
            <div className='w-1/2 bg-[#ced4da] h-[1px]'></div>
            <div className='text-[#adb5bd]'>or</div>
            <div className='w-1/2 bg-[#ced4da] h-[1px]'></div>
          </div>
          <div className='flex items-center justify-center space-x-3 border-[1px] border-[#ced4da] rounded-lg py-2 cursor-pointer'>
            <img src={icons.googleIcon} alt='google' className='w-4 h-4' />
            <p className='font-medium'>Sign up with Google</p>
          </div>
          <div className='text-center'>
            <p className='text-[#6c757d] text-sm font-medium'>
              Have an account?{' '}
              <Link to='/signin' className='text-blue-600 cursor-pointer'>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
