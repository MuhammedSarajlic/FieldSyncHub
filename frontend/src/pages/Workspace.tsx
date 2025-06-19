import { useEffect, useState } from 'react';
import {
  CheckCircle,
  ChevronRight,
  Building2,
  Users,
  Paintbrush,
  Wrench,
  Settings,
  Upload,
  ArrowRight,
  ArrowLeft,
  Globe,
  Phone,
  User,
  Check,
} from 'lucide-react';
import { TAddWorkspace } from '../types/Workspace';
import { CreateWorkspace } from '../services/Workspace';
import { useAuth } from '../context/AuthProvider';
import { CompanySize } from '../constants/Enumeration/WorkspaceEnum/WorkspaceEnum';
import { uploadFile } from '../firebase/uploadFile';

// Enum for steps in our onboarding process (removed TEAM step)
enum OnboardingStep {
  WELCOME = 0,
  COMPANY_INFO = 1,
  WORKSPACE_DETAILS = 2,
  THEME = 3,
  CATEGORY = 4,
  COMPLETE = 5,
}

const Workspace = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    OnboardingStep.WELCOME
  );
  const [workspace, setWorkspace] = useState<TAddWorkspace>({
    name: '',
    companyName: '',
    companyUrl: '',
    phoneNumber: '',
    size: CompanySize.Solo,
    createdByUserId: user?.id ?? '',
    logoUrl: '',
    theme: 'light',
    category: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [otherCategory, setOtherCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Company size options with descriptions
  const companySizeOptions = [
    {
      value: CompanySize.Solo,
      label: 'Just Me',
      description: 'Solo entrepreneur or freelancer',
      icon: User,
    },
    {
      value: CompanySize.Small,
      label: '2-5 People',
      description: 'Small team getting started',
      icon: Users,
    },
    {
      value: CompanySize.Medium,
      label: '6-10 People',
      description: 'Growing business',
      icon: Building2,
    },
    {
      value: CompanySize.Large,
      label: '10+ People',
      description: 'Established company',
      icon: Building2,
    },
  ];

  // Predefined service categories with better organization
  const serviceCategories = [
    'Plumbing Services',
    'HVAC Services',
    'Electrical Services',
    'Landscaping & Gardening',
    'Cleaning Services',
    'Home Renovation',
    'Appliance Repair',
    'Pest Control',
    'Roofing & Gutters',
    'Carpentry & Woodwork',
    'Painting Services',
    'Flooring Installation',
    'Security Systems',
    'Pool Maintenance',
    'Solar Panel Installation',
    'Window Installation & Repair',
    'Masonry & Concrete',
    'Locksmith Services',
    'Moving Services',
    'General Contractor',
    'Other',
  ];

  // Theme options (only light and dark, green stays as primary color)
  const themes = {
    light: {
      primary: 'bg-emerald-600',
      hover: 'hover:bg-emerald-700',
      light: 'bg-gray-50',
      text: 'text-gray-900',
      border: 'border-gray-200',
      ring: 'ring-emerald-500',
      name: 'Light Theme',
      preview: 'bg-gray-100',
    },
    dark: {
      primary: 'bg-emerald-600',
      hover: 'hover:bg-emerald-700',
      light: 'bg-slate-900',
      text: 'text-white',
      border: 'border-slate-700',
      ring: 'ring-emerald-500',
      name: 'Dark Theme',
      preview: 'bg-slate-800',
    },
  };

  const currentTheme = themes[selectedTheme];

  // Handle file selection for workspace logo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setWorkspace((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (): Promise<string | null> => {
    if (!logoFile) return null;
    try {
      const url = await uploadFile(logoFile);
      return url;
    } catch (error) {
      console.error('Upload failed', error);
      return null;
    }
  };

  const handleCreateWorkspace = async () => {
    setIsLoading(true);
    try {
      if (!user) return;

      const uploadedUrl = await handleUpload();
      if (!uploadedUrl) return;

      const finalWorkspace = {
        ...workspace,
        createdByUserId: user.id,
        theme: selectedTheme,
        logoUrl: uploadedUrl,
        category:
          selectedCategory === 'Other' ? otherCategory : selectedCategory,
      };

      const response = await CreateWorkspace(finalWorkspace, user.id);
      if (response.status === 200) {
        setCurrentStep(OnboardingStep.COMPLETE);
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (step: OnboardingStep): boolean => {
    switch (step) {
      case OnboardingStep.COMPANY_INFO:
        return !!(workspace.companyName && workspace.phoneNumber);
      case OnboardingStep.WORKSPACE_DETAILS:
        return !!workspace.name;
      case OnboardingStep.CATEGORY:
        return !!(
          selectedCategory &&
          (selectedCategory !== 'Other' || otherCategory)
        );
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < OnboardingStep.COMPLETE) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > OnboardingStep.WELCOME) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    if (user?.id) {
      setWorkspace((prevWorkspace) => ({
        ...prevWorkspace,
        createdByUserId: user.id,
      }));
    }
  }, [user]);

  if (!user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
      </div>
    );
  }

  // Progress indicators (removed Team step)
  const renderProgressSteps = () => {
    const steps = [
      { name: 'Welcome', icon: Building2 },
      { name: 'Company', icon: Building2 },
      { name: 'Workspace', icon: Settings },
      { name: 'Theme', icon: Paintbrush },
      { name: 'Category', icon: Wrench },
    ];

    return (
      <div className='flex items-center justify-center mb-12 w-full max-w-4xl mx-auto px-4'>
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <div key={index} className='flex items-center flex-1'>
              <div className='flex flex-col items-center relative'>
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 border-2 ${
                    index < currentStep
                      ? 'bg-emerald-600 border-transparent text-white shadow-lg'
                      : index === currentStep
                      ? 'bg-white border-emerald-600 text-emerald-600 shadow-md'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle size={20} />
                  ) : (
                    <StepIcon size={20} />
                  )}
                </div>
                <span
                  className={`text-sm mt-2 font-medium transition-colors duration-300 ${
                    index <= currentStep ? 'text-emerald-600' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className='flex-1 h-px mx-4 transition-colors duration-300'>
                  <div
                    className={`h-full transition-all duration-500 ${
                      index < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return (
          <div className='text-center max-w-2xl mx-auto'>
            <div className='mb-8'>
              <div className='w-24 h-24 mx-auto mb-6 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl'>
                <span className='text-white text-2xl font-bold'>FS</span>
              </div>
              <h1 className='text-4xl font-bold text-gray-900 mb-4'>
                Welcome to FieldSyncHub
              </h1>
              <p className='text-xl text-gray-600 leading-relaxed'>
                Let's set up your workspace and get you ready to manage your
                field service operations with precision and efficiency.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
              <div className='p-6 bg-white rounded-xl border border-gray-200 shadow-sm'>
                <div className='w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto'>
                  <Settings className='text-emerald-600' size={24} />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>Easy Setup</h3>
                <p className='text-gray-600 text-sm'>
                  Get started in minutes with our guided onboarding process
                </p>
              </div>

              <div className='p-6 bg-white rounded-xl border border-gray-200 shadow-sm'>
                <div className='w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto'>
                  <Users className='text-emerald-600' size={24} />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>Team Ready</h3>
                <p className='text-gray-600 text-sm'>
                  Invite your team and start collaborating immediately
                </p>
              </div>

              <div className='p-6 bg-white rounded-xl border border-gray-200 shadow-sm'>
                <div className='w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto'>
                  <Building2 className='text-emerald-600' size={24} />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Professional
                </h3>
                <p className='text-gray-600 text-sm'>
                  Enterprise-grade tools for businesses of all sizes
                </p>
              </div>
            </div>

            <button
              onClick={nextStep}
              className='bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center mx-auto text-lg'
            >
              Get Started <ChevronRight className='ml-2' size={20} />
            </button>
          </div>
        );

      case OnboardingStep.COMPANY_INFO:
        return (
          <div className='max-w-2xl mx-auto'>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                Tell us about your company
              </h2>
              <p className='text-gray-600 text-lg'>
                This information helps us personalize your experience and set up
                your workspace properly.
              </p>
            </div>

            <div className='space-y-6'>
              <div>
                <label
                  htmlFor='company-name'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  Company Name *
                </label>
                <input
                  id='company-name'
                  type='text'
                  value={workspace.companyName}
                  onChange={(e) =>
                    setWorkspace({ ...workspace, companyName: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200'
                  placeholder='e.g., Smith Plumbing & Heating'
                  required
                />
              </div>

              <div>
                <label
                  htmlFor='company-url'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  Company Website{' '}
                  <span className='text-gray-400'>(Optional)</span>
                </label>
                <div className='relative'>
                  <Globe
                    className='absolute left-3 top-3.5 text-gray-400'
                    size={18}
                  />
                  <input
                    id='company-url'
                    type='url'
                    value={workspace.companyUrl}
                    onChange={(e) =>
                      setWorkspace({ ...workspace, companyUrl: e.target.value })
                    }
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200'
                    placeholder='https://www.yourcompany.com'
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='phone-number'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  Phone Number *
                </label>
                <div className='relative'>
                  <Phone
                    className='absolute left-3 top-3.5 text-gray-400'
                    size={18}
                  />
                  <input
                    id='phone-number'
                    type='tel'
                    value={workspace.phoneNumber}
                    onChange={(e) =>
                      setWorkspace({
                        ...workspace,
                        phoneNumber: e.target.value,
                      })
                    }
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200'
                    placeholder='(555) 123-4567'
                    required
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-4'>
                  Company Size *
                </label>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {companySizeOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <div
                        key={option.value}
                        onClick={() =>
                          setWorkspace({ ...workspace, size: option.value })
                        }
                        className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                          workspace.size === option.value
                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className='flex items-start space-x-3'>
                          <div
                            className={`p-2 rounded-lg ${
                              workspace.size === option.value
                                ? 'bg-emerald-100'
                                : 'bg-gray-100'
                            }`}
                          >
                            <IconComponent
                              size={20}
                              className={
                                workspace.size === option.value
                                  ? 'text-emerald-600'
                                  : 'text-gray-600'
                              }
                            />
                          </div>
                          <div className='flex-1'>
                            <h3 className='font-semibold text-gray-900'>
                              {option.label}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {option.description}
                            </p>
                          </div>
                          {workspace.size === option.value && (
                            <Check className='text-emerald-600' size={20} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className='flex justify-between mt-8'>
              <button
                onClick={prevStep}
                className='flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-200'
              >
                <ArrowLeft className='mr-2' size={18} />
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!isStepValid(OnboardingStep.COMPANY_INFO)}
                className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isStepValid(OnboardingStep.COMPANY_INFO)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue <ArrowRight className='ml-2' size={18} />
              </button>
            </div>
          </div>
        );

      case OnboardingStep.WORKSPACE_DETAILS:
        return (
          <div className='max-w-2xl mx-auto'>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                Create Your Workspace
              </h2>
              <p className='text-gray-600 text-lg'>
                Your workspace is the central hub where you'll manage all your
                field service operations.
              </p>
            </div>

            <div className='space-y-8'>
              <div>
                <label
                  htmlFor='workspace-name'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  Workspace Name *
                </label>
                <input
                  id='workspace-name'
                  type='text'
                  value={workspace.name}
                  onChange={(e) =>
                    setWorkspace({ ...workspace, name: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200'
                  placeholder='e.g., Smith Plumbing Operations'
                  required
                />
                <p className='text-sm text-gray-500 mt-1'>
                  This will be the main name for your workspace dashboard
                </p>
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-4'>
                  Company Logo <span className='text-gray-400'>(Optional)</span>
                </label>
                <div className='flex items-center space-x-6'>
                  <div className='w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50'>
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt='Logo preview'
                        className='w-full h-full object-contain rounded-lg'
                      />
                    ) : (
                      <Upload className='text-gray-400' size={32} />
                    )}
                  </div>
                  <div className='flex-1'>
                    <label
                      htmlFor='logo-upload'
                      className='inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-200'
                    >
                      <Upload className='mr-2' size={16} />
                      Upload Logo
                    </label>
                    <input
                      id='logo-upload'
                      type='file'
                      accept='image/*'
                      onChange={handleFileChange}
                      className='hidden'
                    />
                    <div className='mt-2'>
                      <p className='text-sm text-gray-600'>
                        PNG, JPG or SVG • Max 5MB
                      </p>
                      <p className='text-xs text-gray-500'>
                        Recommended: 512×512px for best quality
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex justify-between mt-8'>
              <button
                onClick={prevStep}
                className='flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-200'
              >
                <ArrowLeft className='mr-2' size={18} />
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!isStepValid(OnboardingStep.WORKSPACE_DETAILS)}
                className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isStepValid(OnboardingStep.WORKSPACE_DETAILS)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue <ArrowRight className='ml-2' size={18} />
              </button>
            </div>
          </div>
        );

      case OnboardingStep.THEME:
        return (
          <div className='max-w-3xl mx-auto'>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                Choose Your Theme
              </h2>
              <p className='text-gray-600 text-lg'>
                Select a theme that matches your working style. The emerald
                color will remain as your primary brand color.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-2xl mx-auto'>
              {Object.entries(themes).map(([themeKey, themeColors]) => (
                <div
                  key={themeKey}
                  onClick={() => {
                    setWorkspace({ ...workspace, theme: themeKey });
                    setSelectedTheme(themeKey as 'light' | 'dark');
                  }}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 ${
                    selectedTheme === themeKey
                      ? 'border-emerald-500 shadow-lg bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className='space-y-4'>
                    <div className='relative'>
                      <div
                        className={`w-full h-24 rounded-lg ${themeColors.preview} shadow-inner border`}
                      ></div>
                      <div className='absolute top-2 left-2 w-6 h-6 bg-emerald-600 rounded shadow-sm'></div>
                      <div className='absolute top-2 right-2 w-16 h-2 bg-emerald-600 rounded opacity-75'></div>
                      <div className='absolute bottom-2 left-2 w-8 h-2 bg-emerald-600 rounded opacity-50'></div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-semibold text-gray-900'>
                          {themeColors.name}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {themeKey === 'light'
                            ? 'Clean and bright interface'
                            : 'Elegant dark interface'}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                          selectedTheme === themeKey
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedTheme === themeKey && (
                          <div className='w-full h-full flex items-center justify-center'>
                            <div className='w-2 h-2 rounded-full bg-white'></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='flex justify-between'>
              <button
                onClick={prevStep}
                className='flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-200'
              >
                <ArrowLeft className='mr-2' size={18} />
                Back
              </button>
              <button
                onClick={nextStep}
                className='flex items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200'
              >
                Continue <ArrowRight className='ml-2' size={18} />
              </button>
            </div>
          </div>
        );

      case OnboardingStep.CATEGORY:
        return (
          <div className='max-w-4xl mx-auto'>
            <div className='text-center mb-8'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                What's Your Service Category?
              </h2>
              <p className='text-gray-600 text-lg'>
                This helps us customize features and recommendations for your
                specific industry.
              </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
              {serviceCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    if (category !== 'Other') {
                      setOtherCategory('');
                    }
                  }}
                  className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                    selectedCategory === category
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-gray-900'>
                      {category}
                    </span>
                    {selectedCategory === category && (
                      <Check className='text-emerald-600' size={18} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {selectedCategory === 'Other' && (
              <div className='mb-8'>
                <label
                  htmlFor='other-category'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  Please specify your service category *
                </label>
                <input
                  id='other-category'
                  type='text'
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200'
                  placeholder='e.g., Auto Repair, Consulting, etc.'
                  required
                />
              </div>
            )}

            <div className='flex justify-between'>
              <button
                onClick={prevStep}
                className='flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-200'
              >
                <ArrowLeft className='mr-2' size={18} />
                Back
              </button>
              <button
                onClick={handleCreateWorkspace}
                disabled={!isStepValid(OnboardingStep.CATEGORY) || isLoading}
                className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isStepValid(OnboardingStep.CATEGORY) && !isLoading
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Workspace <ArrowRight className='ml-2' size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case OnboardingStep.COMPLETE:
        return (
          <div className='text-center max-w-2xl mx-auto'>
            <div className='mb-8'>
              <div className='w-24 h-24 mx-auto mb-6 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl'>
                <CheckCircle className='text-white' size={48} />
              </div>
              <h1 className='text-4xl font-bold text-gray-900 mb-4'>
                🎉 Workspace Created Successfully!
              </h1>
              <p className='text-xl text-gray-600 leading-relaxed mb-8'>
                Welcome to FieldSyncHub! Your workspace "{workspace.name}" is
                now ready. You can start managing your field service operations
                right away.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-12'>
              <div className='p-6 bg-white rounded-xl border border-gray-200 shadow-sm'>
                <div className='w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto'>
                  <Users className='text-emerald-600' size={24} />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Invite Your Team
                </h3>
                <p className='text-gray-600 text-sm'>
                  Add team members and start collaborating on projects
                </p>
              </div>

              <div className='p-6 bg-white rounded-xl border border-gray-200 shadow-sm'>
                <div className='w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto'>
                  <Settings className='text-emerald-600' size={24} />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Customize Settings
                </h3>
                <p className='text-gray-600 text-sm'>
                  Configure your workspace preferences and integrations
                </p>
              </div>
            </div>

            <div className='space-y-4'>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className='w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg'
              >
                Go to Dashboard <ArrowRight className='ml-2' size={20} />
              </button>

              <button
                onClick={() => (window.location.href = '/settings')}
                className='w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center'
              >
                <Settings className='mr-2' size={18} />
                Workspace Settings
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        selectedTheme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
      }`}
    >
      <div className='container mx-auto px-4 py-8'>
        {currentStep !== OnboardingStep.COMPLETE && renderProgressSteps()}

        <div
          className={`${
            selectedTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
