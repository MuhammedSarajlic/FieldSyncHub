import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Building2,
  Users,
  Wrench,
  Settings,
  Upload,
  ArrowRight,
  ArrowLeft,
  Globe,
  Phone,
  User,
  Check,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import images from '../constants/AssetsConstants/images';
import { TAddWorkspace } from '../types/Workspace';
import { CreateWorkspace } from '../services/Workspace';
import { useAuth } from '../context/AuthProvider';
import { CompanySize } from '../constants/Enumeration/WorkspaceEnum/WorkspaceEnum';
import { serviceCategories } from '../constants/ServiceCategories';
import { uploadFile } from '../storage/uploadFile';

// Enum for steps in our onboarding process. No standalone "Welcome" step -
// the user just came from Signup, so onboarding starts directly at the
// first real question. Theme selection is hidden for now (dark mode isn't
// ready yet) - it can come back as a step once that's built out.
enum OnboardingStep {
  COMPANY_INFO = 0,
  WORKSPACE_DETAILS = 1,
  CATEGORY = 2,
  COMPLETE = 3,
}

// Left-panel narrative shown per step, mirroring the rotating slides on Signin/Signup
const stepNarratives = [
  {
    icon: Building2,
    title: 'Tell us about your company',
    description:
      'A few details help us personalize invoices, quotes, and your dashboard for your business.',
  },
  {
    icon: Settings,
    title: 'Name your workspace',
    description:
      'This is the home base your whole team will work from every day.',
  },
  {
    icon: Wrench,
    title: "What's your trade?",
    description:
      "We'll tailor your pricebook and job templates to your industry.",
  },
  {
    icon: CheckCircle,
    title: "You're all set!",
    description:
      'Your workspace is ready. Time to start managing your field service operations.',
  },
];

const inputClass =
  'py-3 block w-full pl-10 pr-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary sm:text-sm';

const primaryButtonClass =
  'flex items-center justify-center px-5 py-2.5 rounded-md font-medium text-sm text-white bg-bg-primary hover:bg-bg-primary-hover shadow-lg shadow-bg-primary/20 transition-all duration-200 disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:shadow-none disabled:cursor-not-allowed';

const Workspace = () => {
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    OnboardingStep.COMPANY_INFO
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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [otherCategory, setOtherCategory] = useState<string>('');
  const [categorySearch, setCategorySearch] = useState<string>('');
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

  // Handle file selection for workspace logo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
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
      if (!uploadedUrl && logoFile !== null) {
        toast.error('Logo upload failed. Please try again.');
        return;
      }

      const finalWorkspace = {
        ...workspace,
        createdByUserId: user.id,
        logoUrl: uploadedUrl ?? undefined,
        category:
          selectedCategory === 'Other' ? otherCategory : selectedCategory,
      };

      const response = await CreateWorkspace(finalWorkspace);
      if (response.status === 200) {
        // The workspace was just created server-side, but the in-memory
        // `user` from AuthProvider still reflects the pre-workspace state
        // (it's only fetched once on token change). Without this refetch,
        // RequireWorkspace keeps seeing user.workspace === null and bounces
        // the user straight back into onboarding after it just succeeded.
        await refetchUser();
        setCurrentStep(OnboardingStep.COMPLETE);
      } else {
        toast.error('Failed to create workspace. Please try again.');
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace. Please try again.');
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
    if (currentStep > OnboardingStep.COMPANY_INFO) {
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
      <div className='min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-bg-primary'></div>
      </div>
    );
  }

  const narrative = stepNarratives[currentStep];
  const NarrativeIcon = narrative.icon;
  const totalDots = stepNarratives.length;

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case OnboardingStep.COMPANY_INFO:
        return (
          <div>
            <div className='text-center'>
              <h2 className='text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight'>
                Tell us about your company
              </h2>
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                This helps us personalize your experience and set up your
                workspace properly.
              </p>
            </div>

            <div className='mt-8 space-y-5'>
              <div>
                <label
                  htmlFor='company-name'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Company Name *
                </label>
                <div className='relative'>
                  <Building2
                    className='absolute left-3 top-3.5 text-gray-400'
                    size={18}
                  />
                  <input
                    id='company-name'
                    type='text'
                    value={workspace.companyName}
                    onChange={(e) =>
                      setWorkspace({
                        ...workspace,
                        companyName: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder='e.g., Smith Plumbing & Heating'
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='company-url'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
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
                      setWorkspace({
                        ...workspace,
                        companyUrl: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder='https://www.yourcompany.com'
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='phone-number'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
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
                    className={inputClass}
                    placeholder='(555) 123-4567'
                    required
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                  Company Size *
                </label>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {companySizeOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = workspace.size === option.value;
                    return (
                      <div
                        key={option.value}
                        onClick={() =>
                          setWorkspace({ ...workspace, size: option.value })
                        }
                        className={`cursor-pointer p-3 border rounded-md transition-all duration-200 ${
                          isSelected
                            ? 'border-bg-primary ring-1 ring-bg-primary bg-bg-primary/5'
                            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <div className='flex items-start space-x-3'>
                          <div
                            className={`p-1.5 rounded-md ${
                              isSelected
                                ? 'bg-bg-primary/10 text-bg-primary'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <IconComponent size={18} />
                          </div>
                          <div className='flex-1'>
                            <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                              {option.label}
                            </h3>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                              {option.description}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className='text-bg-primary' size={16} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className='flex justify-end mt-8'>
              <button
                onClick={nextStep}
                disabled={!isStepValid(OnboardingStep.COMPANY_INFO)}
                className={primaryButtonClass}
              >
                Continue <ArrowRight className='ml-2' size={16} />
              </button>
            </div>
          </div>
        );

      case OnboardingStep.WORKSPACE_DETAILS:
        return (
          <div>
            <div className='text-center'>
              <h2 className='text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight'>
                Create your workspace
              </h2>
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                The central hub where you'll manage all your field service
                operations.
              </p>
            </div>

            <div className='mt-8 space-y-6'>
              <div>
                <label
                  htmlFor='workspace-name'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Workspace Name *
                </label>
                <div className='relative'>
                  <Settings
                    className='absolute left-3 top-3.5 text-gray-400'
                    size={18}
                  />
                  <input
                    id='workspace-name'
                    type='text'
                    value={workspace.name}
                    onChange={(e) =>
                      setWorkspace({ ...workspace, name: e.target.value })
                    }
                    className={inputClass}
                    placeholder='e.g., Smith Plumbing Operations'
                    required
                  />
                </div>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1.5'>
                  This will be the main name for your workspace dashboard.
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                  Company Logo <span className='text-gray-400'>(Optional)</span>
                </label>
                <div className='flex items-center space-x-4'>
                  <div className='w-20 h-20 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0'>
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
                  <div className='flex-1'>
                    <label
                      htmlFor='logo-upload'
                      className='inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200'
                    >
                      <Upload className='mr-2' size={14} />
                      Upload Logo
                    </label>
                    <input
                      id='logo-upload'
                      type='file'
                      accept='image/*'
                      onChange={handleFileChange}
                      className='hidden'
                    />
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1.5'>
                      PNG, JPG or SVG &bull; Max 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex justify-between mt-8'>
              <button
                onClick={prevStep}
                className='flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200'
              >
                <ArrowLeft className='mr-1.5' size={16} />
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!isStepValid(OnboardingStep.WORKSPACE_DETAILS)}
                className={primaryButtonClass}
              >
                Continue <ArrowRight className='ml-2' size={16} />
              </button>
            </div>
          </div>
        );

      case OnboardingStep.CATEGORY: {
        const namedCategories = serviceCategories.filter((c) => c !== 'Other');
        const filteredCategories = categorySearch.trim()
          ? namedCategories.filter((c) =>
              c.toLowerCase().includes(categorySearch.trim().toLowerCase())
            )
          : namedCategories;
        const selectCategory = (category: string) => {
          setSelectedCategory(category);
          if (category !== 'Other') {
            setOtherCategory('');
          }
        };

        return (
          <div>
            <div className='text-center'>
              <h2 className='text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight'>
                What's your service category?
              </h2>
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                This helps us customize features and recommendations for your
                industry.
              </p>
            </div>

            <div className='relative mt-6'>
              <Search
                className='absolute left-3 top-3 text-gray-400'
                size={16}
              />
              <input
                type='text'
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder='Search for your trade...'
                className='w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary text-sm'
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 max-h-64 overflow-y-auto pr-1'>
              {filteredCategories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => selectCategory(category)}
                    className={`p-3 text-left border rounded-md transition-all duration-200 ${
                      isSelected
                        ? 'border-bg-primary ring-1 ring-bg-primary bg-bg-primary/5'
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                        {category}
                      </span>
                      {isSelected && (
                        <Check className='text-bg-primary flex-shrink-0' size={16} />
                      )}
                    </div>
                  </button>
                );
              })}
              {filteredCategories.length === 0 && (
                <p className='col-span-full text-sm text-gray-500 dark:text-gray-400 py-3'>
                  No match for "{categorySearch}" &mdash; no worries, pick
                  Other below and tell us what you do.
                </p>
              )}
            </div>

            <button
              onClick={() => selectCategory('Other')}
              className={`w-full mt-2.5 p-3 text-left border rounded-md transition-all duration-200 ${
                selectedCategory === 'Other'
                  ? 'border-bg-primary ring-1 ring-bg-primary bg-bg-primary/5'
                  : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
              }`}
            >
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  Other
                </span>
                {selectedCategory === 'Other' && (
                  <Check className='text-bg-primary flex-shrink-0' size={16} />
                )}
              </div>
            </button>

            {selectedCategory === 'Other' && (
              <div className='mt-4'>
                <label
                  htmlFor='other-category'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Please specify your service category *
                </label>
                <input
                  id='other-category'
                  type='text'
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  className='w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-bg-primary focus:border-bg-primary sm:text-sm'
                  placeholder='e.g., Auto Repair, Consulting, etc.'
                  required
                />
              </div>
            )}

            <div className='flex justify-between mt-8'>
              <button
                onClick={prevStep}
                className='flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200'
              >
                <ArrowLeft className='mr-1.5' size={16} />
                Back
              </button>
              <button
                onClick={handleCreateWorkspace}
                disabled={!isStepValid(OnboardingStep.CATEGORY) || isLoading}
                className={primaryButtonClass}
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Workspace <ArrowRight className='ml-2' size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      }

      case OnboardingStep.COMPLETE:
        return (
          <div className='text-center'>
            <div className='w-16 h-16 mx-auto mb-6 bg-bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-bg-primary/20'>
              <CheckCircle className='text-white' size={32} />
            </div>
            <h2 className='text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight'>
              Workspace created!
            </h2>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              Welcome to FieldSyncHub! "{workspace.name}" is ready to go.
            </p>

            <div className='space-y-3 mt-8'>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('/home')}
                className={`${primaryButtonClass} w-full`}
              >
                Go to Dashboard <ArrowRight className='ml-2' size={18} />
              </motion.button>

              <button
                onClick={() => navigate('/settings')}
                className='w-full flex items-center justify-center px-5 py-2.5 rounded-md font-medium text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200'
              >
                <Settings className='mr-2' size={16} />
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
    <div className='w-full h-screen flex bg-gray-50 dark:bg-gray-950 font-sans overflow-hidden'>
      {/* Left decorative panel, narrative changes per onboarding step. Slides
          in from the left on arrival so coming from Signup/Signin (which
          share this exact branded panel) reads as one continuous transition
          rather than an abrupt page swap. */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='hidden lg:flex w-1/2 bg-bg-primary items-center justify-center relative overflow-hidden'
      >
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
              className='max-w-[220px] mb-10 filter brightness-0 invert'
            />
          </motion.div>

          <div className='relative h-56 overflow-hidden'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className='absolute inset-0'
              >
                <div className='w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6'>
                  <NarrativeIcon className='text-white' size={22} />
                </div>
                <h2 className='text-4xl font-bold text-white mb-4'>
                  {narrative.title}
                </h2>
                <p className='text-white/90 text-lg'>
                  {narrative.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className='flex space-x-3 mt-8'>
            {Array.from({ length: totalDots }).map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-white w-8'
                    : index < currentStep
                    ? 'bg-white/70 w-2'
                    : 'bg-white/30 w-2'
                }`}
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
      </motion.div>

      {/* Right form panel - slides/fades in just after the left panel so the
          two feel like one arriving scene rather than an instant page swap. */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className='w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-y-auto'
      >
        <div className='text-center lg:hidden mb-8'>
          <img src={images.logo} alt='logo' className='mx-auto h-10 w-auto' />
        </div>

        <AnimatePresence mode='wait'>
          <motion.div
            key={currentStep}
            className='w-full max-w-md'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Workspace;
