import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Lock, Mail, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

const InviteJoin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await axios.get(`/api/invite/validate?token=${token}`);
        setInvite(res.data);
      } catch (err) {
        setError('This invite is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (token) validateToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords don't match");
    }

    try {
      await axios.post('/api/invite/accept', {
        token,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Something went wrong.');
    }
  };

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
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4'>
      <div className='bg-white shadow-xl rounded-xl p-8 max-w-md w-full'>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>
          Join Workspace
        </h2>
        <p className='text-sm text-gray-500 mb-6'>
          You're joining{' '}
          <span className='font-medium text-indigo-600'>
            {invite.workspace?.name || 'this workspace'}
          </span>{' '}
          as a <span className='font-medium'>{invite.role}</span>.
        </p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='text-sm font-medium text-gray-700 block mb-1'>
              Email
            </label>
            <div className='relative'>
              <Mail
                className='absolute left-3 top-2.5 text-gray-400'
                size={16}
              />
              <input
                type='email'
                value={invite.email}
                disabled
                className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-sm font-medium text-gray-700 block mb-1'>
                First Name
              </label>
              <div className='relative'>
                <User
                  className='absolute left-3 top-2.5 text-gray-400'
                  size={16}
                />
                <input
                  name='firstName'
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md'
                />
              </div>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-700 block mb-1'>
                Last Name
              </label>
              <div className='relative'>
                <User
                  className='absolute left-3 top-2.5 text-gray-400'
                  size={16}
                />
                <input
                  name='lastName'
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md'
                />
              </div>
            </div>
          </div>

          <div>
            <label className='text-sm font-medium text-gray-700 block mb-1'>
              Password
            </label>
            <div className='relative'>
              <Lock
                className='absolute left-3 top-2.5 text-gray-400'
                size={16}
              />
              <input
                type='password'
                name='password'
                required
                value={formData.password}
                onChange={handleChange}
                className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
          </div>

          <div>
            <label className='text-sm font-medium text-gray-700 block mb-1'>
              Confirm Password
            </label>
            <div className='relative'>
              <Lock
                className='absolute left-3 top-2.5 text-gray-400'
                size={16}
              />
              <input
                type='password'
                name='confirmPassword'
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
          </div>

          {error && <p className='text-sm text-red-600'>{error}</p>}

          <button
            type='submit'
            className='w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition'
          >
            Join Workspace
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteJoin;
