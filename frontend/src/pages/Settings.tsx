import { useEffect, useState } from 'react';
import {
  Building2,
  User,
  Users,
  Upload,
  Save,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Phone,
  ArrowRight,
  ShieldCheck,
  Copy,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Button from '../components/CustomElements/Button';
import { useAuth } from '../context/AuthProvider';
import { GetWorkspaceById, UpdateWorkspace } from '../services/Workspace';
import { UpdateUser } from '../services/User';
import {
  UpdatePassword,
  BeginTwoFactorSetup,
  ConfirmTwoFactorSetup,
  DisableTwoFactor,
} from '../services/Auth';
import { uploadFile } from '../storage/uploadFile';
import { CompanySize } from '../constants/Enumeration/WorkspaceEnum/WorkspaceEnum';
import { UserRole } from '../constants/Enumeration/UserEnum/UserEnum';
import { serviceCategories } from '../constants/ServiceCategories';
import { TUpdateWorkspace } from '../types/Workspace';

const settingSections = [
  { id: 'company', name: 'Company Profile', icon: Building2 },
  { id: 'account', name: 'My Account', icon: User },
  { id: 'team', name: 'Team', icon: Users },
];

const companySizeLabels: Record<CompanySize, string> = {
  [CompanySize.Solo]: 'Just Me',
  [CompanySize.Small]: '2-5 People',
  [CompanySize.Medium]: '6-10 People',
  [CompanySize.Large]: '10+ People',
};

const currencyOptions = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
const paymentTermOptions = [
  { value: 'uponReceipt', label: 'Upon receipt' },
  { value: 'net15', label: 'Net 15' },
  { value: 'net30', label: 'Net 30' },
  { value: 'custom', label: 'Custom' },
];

const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bg-primary focus:border-bg-primary text-sm';

const Settings = () => {
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('company');

  // Company Profile
  const [workspace, setWorkspace] = useState<TUpdateWorkspace | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  // My Account
  const [accountForm, setAccountForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Two-factor authentication
  const [twoFactorStep, setTwoFactorStep] = useState<
    'idle' | 'awaiting-code' | 'recovery-codes'
  >('idle');
  const [twoFactorManualKey, setTwoFactorManualKey] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [isTwoFactorBusy, setIsTwoFactorBusy] = useState(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!user?.workspace?.id) return;
      setIsLoadingWorkspace(true);
      try {
        const response = await GetWorkspaceById(user.workspace.id);
        if (response.status === 200) {
          const ws = response.data.payload;
          setWorkspace({
            id: ws.id,
            name: ws.name,
            companyName: ws.companyName,
            companyUrl: ws.companyUrl,
            phoneNumber: ws.phoneNumber,
            currency: ws.currency,
            defaultTaxRate: ws.defaultTaxRate,
            defaultPaymentTerms: ws.defaultPaymentTerms,
            taxRegistrationNumber: ws.taxRegistrationNumber,
            addressLine1: ws.addressLine1,
            addressLine2: ws.addressLine2,
            city: ws.city,
            state: ws.state,
            postalCode: ws.postalCode,
            country: ws.country,
            size: ws.size,
            category: ws.category,
            logoUrl: ws.logoUrl,
          });
          localStorage.setItem('workspaceCurrency', ws.currency || 'USD');
          setLogoPreview(ws.logoUrl ?? null);
        }
      } catch (error) {
        console.error('Failed to load workspace', error);
      } finally {
        setIsLoadingWorkspace(false);
      }
    };
    fetchWorkspace();
  }, [user?.workspace?.id]);

  useEffect(() => {
    if (user) {
      setAccountForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveCompany = async () => {
    if (!workspace) return;
    setIsSavingCompany(true);
    try {
      let logoUrl = workspace.logoUrl;
      if (logoFile) {
        logoUrl = await uploadFile(logoFile);
      }
      const response = await UpdateWorkspace({ ...workspace, logoUrl });
      if (response.status === 200) {
        localStorage.setItem(
          'workspaceCurrency',
          response.data.payload.currency || workspace.currency || 'USD'
        );
        toast.success('Company profile updated');
        setLogoFile(null);
        await refetchUser();
      } else {
        toast.error('Failed to update company profile');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update company profile');
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!user) return;
    setIsSavingAccount(true);
    try {
      const response = await UpdateUser({ id: user.id, ...accountForm });
      if (response.status === 200 && response.data.success) {
        toast.success(response.data.errorMessage || 'Account updated');
        await refetchUser();
      } else {
        toast.error(response.data?.errorMessage || 'Failed to update account');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update account');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    setIsSavingPassword(true);
    try {
      await UpdatePassword(
        user.id,
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      toast.success('Password changed');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data || 'Failed to change password. Check your current password.'
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleBeginTwoFactorSetup = async () => {
    setIsTwoFactorBusy(true);
    try {
      const response = await BeginTwoFactorSetup();
      setTwoFactorManualKey(response.data.manualEntryKey);
      setTwoFactorStep('awaiting-code');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          'Could not start two-factor setup.'
      );
    } finally {
      setIsTwoFactorBusy(false);
    }
  };

  const handleConfirmTwoFactorSetup = async () => {
    setIsTwoFactorBusy(true);
    try {
      const response = await ConfirmTwoFactorSetup(twoFactorCode);
      setRecoveryCodes(response.data.recoveryCodes);
      setTwoFactorStep('recovery-codes');
      setTwoFactorCode('');
      await refetchUser();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'That code was incorrect.');
    } finally {
      setIsTwoFactorBusy(false);
    }
  };

  const handleFinishTwoFactorSetup = () => {
    setTwoFactorStep('idle');
    setTwoFactorManualKey('');
    setRecoveryCodes([]);
  };

  const handleCancelTwoFactorSetup = () => {
    setTwoFactorStep('idle');
    setTwoFactorManualKey('');
    setTwoFactorCode('');
  };

  const handleDisableTwoFactor = async () => {
    setIsTwoFactorBusy(true);
    try {
      await DisableTwoFactor(disablePassword);
      toast.success('Two-factor authentication disabled');
      setDisablePassword('');
      setShowDisableForm(false);
      await refetchUser();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Incorrect password.');
    } finally {
      setIsTwoFactorBusy(false);
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'company':
        return (
          <div className='space-y-6 max-w-2xl'>
            <h2 className='text-2xl font-bold text-gray-900'>
              Company Profile
            </h2>
            {isLoadingWorkspace || !workspace ? (
              <p className='text-sm text-gray-500'>Loading...</p>
            ) : (
              <>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-3'>
                    Logo
                  </label>
                  <div className='flex items-center space-x-4'>
                    <div className='w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0'>
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt='Logo preview'
                          className='w-full h-full object-contain'
                        />
                      ) : (
                        <Upload className='text-gray-400' size={28} />
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor='logo-upload'
                        className='inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors'
                      >
                        <Upload className='mr-2' size={14} />
                        Upload Logo
                      </label>
                      <input
                        id='logo-upload'
                        type='file'
                        accept='image/*'
                        onChange={handleLogoChange}
                        className='hidden'
                      />
                      <p className='text-xs text-gray-500 mt-1.5'>
                        PNG, JPG or SVG &bull; Max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Company Name
                    </label>
                    <input
                      type='text'
                      value={workspace.companyName ?? ''}
                      onChange={(e) =>
                        setWorkspace({
                          ...workspace,
                          companyName: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Workspace Name
                    </label>
                    <input
                      type='text'
                      value={workspace.name ?? ''}
                      onChange={(e) =>
                        setWorkspace({ ...workspace, name: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Website
                    </label>
                    <div className='relative'>
                      <Globe
                        className='absolute left-3 top-3 text-gray-400'
                        size={16}
                      />
                      <input
                        type='url'
                        value={workspace.companyUrl ?? ''}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            companyUrl: e.target.value,
                          })
                        }
                        placeholder='https://www.yourcompany.com'
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Phone Number
                    </label>
                    <div className='relative'>
                      <Phone
                        className='absolute left-3 top-3 text-gray-400'
                        size={16}
                      />
                      <input
                        type='tel'
                        value={workspace.phoneNumber ?? ''}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder='(555) 123-4567'
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Company Size
                    </label>
                    <select
                      value={workspace.size}
                      onChange={(e) =>
                        setWorkspace({
                          ...workspace,
                          size: Number(e.target.value) as CompanySize,
                        })
                      }
                      className={inputClass}
                    >
                      {Object.values(CompanySize)
                        .filter((v) => typeof v === 'number')
                        .map((value) => (
                          <option key={value} value={value}>
                            {companySizeLabels[value as CompanySize]}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Service Category
                    </label>
                    <select
                      value={workspace.category ?? ''}
                      onChange={(e) =>
                        setWorkspace({
                          ...workspace,
                          category: e.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      <option value=''>Select a category</option>
                      {serviceCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='space-y-4 rounded-lg border border-gray-200 p-5'>
                  <div className='flex items-center gap-2 text-gray-900'>
                    <MapPin size={16} />
                    <h3 className='text-sm font-semibold'>Billing Defaults</h3>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Currency
                      </label>
                      <select
                        value={workspace.currency ?? 'USD'}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            currency: e.target.value,
                          })
                        }
                        className={inputClass}
                      >
                        {currencyOptions.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Default Tax Rate (%)
                      </label>
                      <input
                        type='number'
                        min='0'
                        step='0.01'
                        value={(workspace.defaultTaxRate ?? 0) * 100}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            defaultTaxRate:
                              (parseFloat(e.target.value) || 0) / 100,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Default Payment Terms
                      </label>
                      <select
                        value={workspace.defaultPaymentTerms ?? 'uponReceipt'}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            defaultPaymentTerms: e.target.value,
                          })
                        }
                        className={inputClass}
                      >
                        {paymentTermOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Tax Registration Number
                      </label>
                      <input
                        type='text'
                        value={workspace.taxRegistrationNumber ?? ''}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            taxRegistrationNumber: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className='space-y-4 rounded-lg border border-gray-200 p-5'>
                  <h3 className='text-sm font-semibold text-gray-900'>
                    Business Address
                  </h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Address Line 1
                      </label>
                      <input
                        type='text'
                        value={workspace.addressLine1 ?? ''}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            addressLine1: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Address Line 2
                      </label>
                      <input
                        type='text'
                        value={workspace.addressLine2 ?? ''}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            addressLine2: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        City
                      </label>
                      <input
                        type='text'
                        value={workspace.city ?? ''}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            city: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        State / Region
                      </label>
                      <input
                        type='text'
                        value={workspace.state ?? ''}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            state: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Postal Code
                      </label>
                      <input
                        type='text'
                        value={workspace.postalCode ?? ''}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            postalCode: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Country
                      </label>
                      <input
                        type='text'
                        value={workspace.country ?? ''}
                        onChange={(e) =>
                          setWorkspace({
                            ...workspace,
                            country: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className='pt-2'>
                  <Button
                    variant='primary'
                    onClick={handleSaveCompany}
                    disabled={isSavingCompany}
                    leftIcon={<Save size={16} />}
                  >
                    {isSavingCompany ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </>
            )}
          </div>
        );

      case 'account':
        return (
          <div className='space-y-10 max-w-2xl'>
            <div className='space-y-6'>
              <h2 className='text-2xl font-bold text-gray-900'>My Account</h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    First Name
                  </label>
                  <input
                    type='text'
                    value={accountForm.firstName}
                    onChange={(e) =>
                      setAccountForm({
                        ...accountForm,
                        firstName: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Last Name
                  </label>
                  <input
                    type='text'
                    value={accountForm.lastName}
                    onChange={(e) =>
                      setAccountForm({
                        ...accountForm,
                        lastName: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Email
                </label>
                <input
                  type='email'
                  value={accountForm.email}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, email: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <Button
                variant='primary'
                onClick={handleSaveAccount}
                disabled={isSavingAccount}
                leftIcon={<Save size={16} />}
              >
                {isSavingAccount ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            <div className='space-y-4 pt-6 border-t border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Change Password
              </h3>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Current Password
                </label>
                <div className='relative'>
                  <Lock
                    className='absolute left-3 top-3 text-gray-400'
                    size={16}
                  />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    New Password
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Confirm New Password
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                type='button'
                onClick={() => setShowPasswords(!showPasswords)}
                className='inline-flex items-center text-xs text-gray-500 hover:text-gray-700'
              >
                {showPasswords ? (
                  <EyeOff className='mr-1.5' size={14} />
                ) : (
                  <Eye className='mr-1.5' size={14} />
                )}
                {showPasswords ? 'Hide' : 'Show'} passwords
              </button>
              <div>
                <Button
                  variant='secondary'
                  onClick={handleChangePassword}
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </div>

            <div className='space-y-4 pt-6 border-t border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                <ShieldCheck size={18} />
                Two-Factor Authentication
              </h3>

              {twoFactorStep === 'idle' && (
                <>
                  {user?.twoFactorEnabled ? (
                    <div className='space-y-3'>
                      <p className='text-sm text-gray-600'>
                        Two-factor authentication is{' '}
                        <span className='font-medium text-green-700'>
                          enabled
                        </span>{' '}
                        on your account.
                      </p>
                      {!showDisableForm ? (
                        <Button
                          variant='secondary'
                          onClick={() => setShowDisableForm(true)}
                        >
                          Disable
                        </Button>
                      ) : (
                        <div className='space-y-3 max-w-sm'>
                          <label className='block text-sm font-medium text-gray-700'>
                            Confirm your current password
                          </label>
                          <input
                            type='password'
                            value={disablePassword}
                            onChange={(e) =>
                              setDisablePassword(e.target.value)
                            }
                            className={inputClass}
                          />
                          <div className='flex gap-2'>
                            <Button
                              variant='secondary'
                              onClick={handleDisableTwoFactor}
                              disabled={isTwoFactorBusy || !disablePassword}
                            >
                              {isTwoFactorBusy
                                ? 'Disabling...'
                                : 'Confirm disable'}
                            </Button>
                            <Button
                              variant='secondary'
                              onClick={() => {
                                setShowDisableForm(false);
                                setDisablePassword('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      <p className='text-sm text-gray-600'>
                        {user?.role === UserRole.Owner
                          ? 'Required for Owner accounts. Add an extra layer of security using an authenticator app (Google Authenticator, Authy, 1Password, etc).'
                          : 'Add an extra layer of security to your account using an authenticator app (Google Authenticator, Authy, 1Password, etc).'}
                      </p>
                      <Button
                        variant='primary'
                        onClick={handleBeginTwoFactorSetup}
                        disabled={isTwoFactorBusy}
                        leftIcon={<ShieldCheck size={16} />}
                      >
                        {isTwoFactorBusy ? 'Starting...' : 'Enable Two-Factor'}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {twoFactorStep === 'awaiting-code' && (
                <div className='space-y-4 max-w-sm'>
                  <p className='text-sm text-gray-600'>
                    Add this key to your authenticator app (most apps have a
                    "Enter a setup key" or "Can't scan?" option), then enter
                    the 6-digit code it generates.
                  </p>
                  <div className='flex items-center gap-2'>
                    <code className='flex-1 px-3 py-2 bg-gray-100 rounded-md text-sm font-mono break-all'>
                      {twoFactorManualKey}
                    </code>
                    <button
                      type='button'
                      onClick={() => {
                        navigator.clipboard?.writeText(twoFactorManualKey);
                        toast.success('Copied');
                      }}
                      className='p-2 text-gray-500 hover:text-gray-700'
                      aria-label='Copy setup key'
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      6-digit code
                    </label>
                    <input
                      type='text'
                      inputMode='numeric'
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder='123456'
                      className={`${inputClass} text-center tracking-widest`}
                    />
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='primary'
                      onClick={handleConfirmTwoFactorSetup}
                      disabled={isTwoFactorBusy || twoFactorCode.length !== 6}
                    >
                      {isTwoFactorBusy ? 'Verifying...' : 'Verify and enable'}
                    </Button>
                    <Button
                      variant='secondary'
                      onClick={handleCancelTwoFactorSetup}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {twoFactorStep === 'recovery-codes' && (
                <div className='space-y-4 max-w-sm'>
                  <p className='text-sm text-gray-600'>
                    Save these recovery codes somewhere safe. Each one can be
                    used once to sign in if you lose access to your
                    authenticator app.{' '}
                    <span className='font-medium text-gray-900'>
                      They won't be shown again.
                    </span>
                  </p>
                  <div className='grid grid-cols-2 gap-2 p-4 bg-gray-100 rounded-md font-mono text-sm'>
                    {recoveryCodes.map((code) => (
                      <div key={code}>{code}</div>
                    ))}
                  </div>
                  <Button
                    variant='primary'
                    onClick={handleFinishTwoFactorSetup}
                  >
                    I've saved these codes
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'team':
        return (
          <div className='max-w-2xl'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>Team</h2>
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-between'>
              <div>
                <h3 className='font-semibold text-gray-900'>
                  Manage your team
                </h3>
                <p className='text-sm text-gray-600 mt-1'>
                  Invite teammates, assign roles, and manage employee records
                  from the Team page.
                </p>
              </div>
              <Button
                variant='primary'
                onClick={() => navigate('/employees')}
                customStyle='flex-shrink-0'
                rightIcon={<ArrowRight size={16} />}
              >
                Go to Team
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 md:ml-64'>
        <Navbar />

        <div className='flex h-[calc(100vh-4rem)]'>
          <div className='w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto flex-shrink-0'>
            <div className='space-y-1'>
              {settingSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-bg-primary/10 text-bg-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className='w-4 h-4' />
                    <span className='text-sm font-medium'>
                      {section.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className='flex-1 p-8 overflow-y-auto'>
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
