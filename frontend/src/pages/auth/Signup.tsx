import { useState } from 'react';
import { Link } from 'react-router';
import icons from '../../constants/icons';
import images from '../../constants/images';
import { Register } from '../../services/Auth';

const Signup = () => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(false);
  const [userLoginData, setUserLoginData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const showPassword = () => {
    setIsPasswordHidden(!isPasswordHidden);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(userLoginData);
    const response = await Register(userLoginData);
    if (response.status === 200) {
      console.log(response);
    }
  };
  return (
    <div className='w-full h-screen flex'>
      <div className='w-1/2 bg-bg-primary'></div>

      <div className='w-1/2 flex flex-col items-center justify-center'>
        <div className='space-y-8 w-1/2'>
          <div>
            <img src={images.logo} alt='logo' className='max-w-[200px]' />
          </div>
          <div className='space-y-3'>
            <p className='font-bold text-3xl text-heading'>
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
                  required
                  type='text'
                  value={userLoginData.firstName}
                  onChange={(e) =>
                    setUserLoginData({
                      ...userLoginData,
                      firstName: e.target.value,
                    })
                  }
                  placeholder='First Name'
                  className='w-full outline-none text-[#212529]'
                />
              </div>
              <div className='w-1/2 flex items-center space-x-3 border-[1px] border-[#ced4da] rounded-lg py-2 px-3'>
                <img src={icons.idCardIcon} alt='mail' className='w-5' />
                <input
                  required
                  type='text'
                  value={userLoginData.lastName}
                  onChange={(e) =>
                    setUserLoginData({
                      ...userLoginData,
                      lastName: e.target.value,
                    })
                  }
                  placeholder='Last Name'
                  className='w-full outline-none text-[#212529]'
                />
              </div>
            </div>
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
                value={userLoginData.password}
                onChange={(e) =>
                  setUserLoginData({
                    ...userLoginData,
                    password: e.target.value,
                  })
                }
                placeholder='Password'
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
            <button
              type='submit'
              className='w-full mt-4 bg-bg-primary text-white py-2 rounded-lg cursor-pointer font-medium hover:bg-bg-primary-hover transition-colors duration-200'
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
              <Link to='/signin' className='text-text-secondary cursor-pointer'>
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
