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
} from 'lucide-react';
import { TAddWorkspace } from '../types/Workspace';
import { CreateWorkspace } from '../services/Workspace';
import { useAuth } from '../context/AuthProvider';

// Enum for steps in our onboarding process
enum OnboardingStep {
  WELCOME = 0,
  WORKSPACE_DETAILS = 1,
  THEME = 2,
  TEAM = 3,
  CATEGORY = 4,
  COMPLETE = 5,
}

const Workspace = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    OnboardingStep.WELCOME
  );
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState<TAddWorkspace>({
    name: '',
    createdBy: user?.id ?? '', // Initial attempt, might be empty initially
    logoUrl: '',
    theme: 'light',
    category: '',
    users: user?.id ? [user.id] : [], // Initial attempt
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<
    'blue' | 'green' | 'purple'
  >('blue');
  const [teamEmails, setTeamEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [otherCategory, setOtherCategory] = useState<string>('');

  // Predefined service categories
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
    'Other',
  ];

  // Themes with tailwind classes for customization
  const themes = {
    blue: {
      primary: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
    green: {
      primary: 'bg-emerald-600',
      hover: 'hover:bg-emerald-700',
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
    },
    purple: {
      primary: 'bg-violet-600',
      hover: 'hover:bg-violet-700',
      light: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-200',
    },
  };

  // Current theme based on selection
  const currentTheme = themes[selectedTheme];

  // Handle file selection for workspace logo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle adding team members
  const handleAddTeamMember = () => {
    if (newEmail && !teamEmails.includes(newEmail)) {
      setTeamEmails([...teamEmails, newEmail]);
      setNewEmail('');
    }
  };

  // Handle removing team members
  const handleRemoveTeamMember = (email: string) => {
    setTeamEmails(teamEmails.filter((e) => e !== email));
  };

  // Function to submit workspace creation
  const handleCreateWorkspace = async () => {
    // Here you would typically send this data to your backend API
    // console.log('Creating workspace:', {
    //   workspace,
    //   logoFile,
    //   selectedTheme,
    //   teamEmails,
    //   category: selectedCategory === 'Other' ? otherCategory : selectedCategory,
    // });
    console.log(workspace);
    if (!user) return;
    setWorkspace({ ...workspace, createdBy: user.id, users: [user.id] });
    const response = await CreateWorkspace(workspace);
    if (response.status === 200) {
      console.log(response);
    }

    // Move to complete step
    setCurrentStep(OnboardingStep.COMPLETE);
  };

  useEffect(() => {
    // Once the user object is available, update the createdBy and users
    if (user?.id) {
      setWorkspace((prevWorkspace) => ({
        ...prevWorkspace,
        createdBy: user.id,
        users: [user.id],
      }));
    }
  }, [user]);

  if (!user) {
    return <p>Loading...</p>;
  }

  // Progress indicators
  const renderProgressSteps = () => {
    const steps = [
      { name: 'Welcome', icon: <Building2 size={20} /> },
      { name: 'Workspace', icon: <Settings size={20} /> },
      { name: 'Theme', icon: <Paintbrush size={20} /> },
      { name: 'Team', icon: <Users size={20} /> },
      { name: 'Category', icon: <Wrench size={20} /> },
    ];

    return (
      <div className='flex items-center justify-center mb-8 w-full max-w-3xl mx-auto'>
        {steps.map((step, index) => (
          <div key={index} className='flex items-center'>
            <div
              className={`flex flex-col items-center ${
                index <= currentStep ? currentTheme.text : 'text-gray-400'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  index < currentStep
                    ? currentTheme.primary + ' text-white'
                    : index === currentStep
                    ? currentTheme.light + ' ' + currentTheme.text
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {index < currentStep ? <CheckCircle size={20} /> : step.icon}
              </div>
              <span
                className={`text-xs mt-1 ${
                  index <= currentStep ? 'font-medium' : ''
                }`}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-1 ${
                  index < currentStep ? currentTheme.primary : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return (
          <div className='text-center'>
            <h1 className='text-3xl font-bold mb-6'>
              Welcome to FieldService Pro
            </h1>
            <p className='text-gray-600 mb-8 max-w-lg mx-auto'>
              Let's set up your workspace and get you ready to manage your field
              service operations efficiently.
            </p>
            <div className='mb-8'>
              <img
                src='/api/placeholder/500/300'
                alt='Onboarding illustration'
                className='mx-auto rounded-lg shadow-lg'
              />
            </div>
            <button
              onClick={() => {
                setCurrentStep(OnboardingStep.WORKSPACE_DETAILS);
                console.log(user);
                console.log(workspace);
              }}
              className={`${currentTheme.primary} ${currentTheme.hover} text-white px-8 py-3 rounded-lg font-medium shadow-md flex items-center mx-auto transition-all`}
            >
              Get Started <ChevronRight className='ml-2' size={18} />
            </button>
          </div>
        );

      case OnboardingStep.WORKSPACE_DETAILS:
        return (
          <div>
            <h2 className='text-2xl font-bold mb-6'>Create Your Workspace</h2>
            <p className='text-gray-600 mb-6'>
              Your workspace is where you'll manage all your field service
              operations.
            </p>

            <div className='mb-6'>
              <label
                htmlFor='workspace-name'
                className='block text-sm font-medium text-gray-700 mb-1'
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
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='e.g., Smith Plumbing Services'
                required
              />
            </div>

            <div className='mb-8'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Company Logo (Optional)
              </label>
              <div className='flex items-center space-x-4'>
                <div
                  className={`w-24 h-24 rounded-lg flex items-center justify-center ${currentTheme.light} ${currentTheme.border} overflow-hidden`}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt='Logo preview'
                      className='w-full h-full object-contain'
                    />
                  ) : (
                    <Upload className={`${currentTheme.text}`} />
                  )}
                </div>
                <div>
                  <label
                    htmlFor='logo-upload'
                    className={`inline-block ${currentTheme.primary} ${currentTheme.hover} text-white px-4 py-2 rounded-md font-medium cursor-pointer transition-colors`}
                  >
                    Upload Logo
                  </label>
                  <input
                    id='logo-upload'
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    className='hidden'
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Recommended: 512×512px PNG or JPG
                  </p>
                </div>
              </div>
            </div>

            <div className='flex justify-between'>
              <button
                onClick={() => setCurrentStep(OnboardingStep.WELCOME)}
                className='text-gray-600 hover:text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors'
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(OnboardingStep.THEME)}
                disabled={!workspace.name}
                className={`${currentTheme.primary} ${
                  currentTheme.hover
                } text-white px-6 py-2 rounded-lg font-medium transition-colors ${
                  !workspace.name ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Continue <ArrowRight className='inline ml-1' size={16} />
              </button>
            </div>
          </div>
        );

      case OnboardingStep.THEME:
        return (
          <div>
            <h2 className='text-2xl font-bold mb-6'>
              Select Your Workspace Theme
            </h2>
            <p className='text-gray-600 mb-6'>
              Choose a color theme that represents your brand identity.
            </p>

            <div className='grid grid-cols-3 gap-4 mb-8'>
              {Object.entries(themes).map(([themeName, themeColors]) => (
                <div
                  key={themeName}
                  onClick={() => {
                    setWorkspace({ ...workspace, theme: themeName });
                    setSelectedTheme(themeName as 'blue' | 'green' | 'purple');
                  }}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    selectedTheme === themeName
                      ? `border-${themeName}-500 shadow-md`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-full h-16 rounded-md ${themeColors.primary} mb-2`}
                  ></div>
                  <div className='flex items-center'>
                    <div
                      className={`w-4 h-4 rounded-full ${
                        selectedTheme === themeName
                          ? themeColors.primary
                          : 'bg-gray-200'
                      } mr-2`}
                    ></div>
                    <span className='capitalize'>{themeName}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className='flex justify-between'>
              <button
                onClick={() => setCurrentStep(OnboardingStep.WORKSPACE_DETAILS)}
                className='text-gray-600 hover:text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors'
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(OnboardingStep.TEAM)}
                className={`${currentTheme.primary} ${currentTheme.hover} text-white px-6 py-2 rounded-lg font-medium transition-colors`}
              >
                Continue <ArrowRight className='inline ml-1' size={16} />
              </button>
            </div>
          </div>
        );

      case OnboardingStep.TEAM:
        return (
          <div>
            <h2 className='text-2xl font-bold mb-6'>Invite Your Team</h2>
            <p className='text-gray-600 mb-6'>
              Add team members who will be working with you in this workspace.
            </p>

            <div className='mb-6 flex'>
              <input
                type='email'
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className='flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='colleague@example.com'
              />
              <button
                onClick={handleAddTeamMember}
                disabled={!newEmail.includes('@')}
                className={`${currentTheme.primary} ${
                  currentTheme.hover
                } text-white px-4 py-2 rounded-r-lg font-medium transition-colors ${
                  !newEmail.includes('@') ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Add
              </button>
            </div>

            <div className='mb-8'>
              {teamEmails.length > 0 ? (
                <div className='space-y-2'>
                  {teamEmails.map((email, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg'
                    >
                      <div className='flex items-center'>
                        <div
                          className={`w-8 h-8 rounded-full ${currentTheme.light} ${currentTheme.text} flex items-center justify-center mr-3`}
                        >
                          {email.charAt(0).toUpperCase()}
                        </div>
                        <span>{email}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveTeamMember(email)}
                        className='text-gray-400 hover:text-red-500'
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  No team members added yet
                </div>
              )}
            </div>

            <div className='flex justify-between'>
              <button
                onClick={() => setCurrentStep(OnboardingStep.THEME)}
                className='text-gray-600 hover:text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors'
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(OnboardingStep.CATEGORY)}
                className={`${currentTheme.primary} ${currentTheme.hover} text-white px-6 py-2 rounded-lg font-medium transition-colors`}
              >
                Continue <ArrowRight className='inline ml-1' size={16} />
              </button>
            </div>
          </div>
        );

      case OnboardingStep.CATEGORY:
        return (
          <div>
            <h2 className='text-2xl font-bold mb-6'>
              Select Your Business Category
            </h2>
            <p className='text-gray-600 mb-6'>
              Choose the category that best describes your field service
              business.
            </p>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8'>
              {serviceCategories.map((category) => (
                <div
                  key={category}
                  onClick={() => {
                    setWorkspace({ ...workspace, category });
                    setSelectedCategory(category);
                  }}
                  className={`cursor-pointer p-4 border rounded-lg transition-all ${
                    selectedCategory === category
                      ? `border-2 ${currentTheme.border} ${currentTheme.light}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center'>
                    <div
                      className={`w-5 h-5 rounded-full border ${
                        selectedCategory === category
                          ? `${currentTheme.primary} border-0`
                          : 'border-gray-300'
                      } mr-3 flex items-center justify-center`}
                    >
                      {selectedCategory === category && (
                        <div className='w-3 h-3 rounded-full bg-white'></div>
                      )}
                    </div>
                    <span>{category}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedCategory === 'Other' && (
              <div className='mb-6'>
                <label
                  htmlFor='other-category'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Specify your category
                </label>
                <input
                  id='other-category'
                  type='text'
                  value={otherCategory}
                  onChange={(e) => {
                    setWorkspace({ ...workspace, category: otherCategory });
                    setOtherCategory(e.target.value);
                  }}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='e.g., Drone Inspection Services'
                  required
                />
              </div>
            )}

            <div className='flex justify-between'>
              <button
                onClick={() => setCurrentStep(OnboardingStep.TEAM)}
                className='text-gray-600 hover:text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors'
              >
                Back
              </button>
              <button
                onClick={handleCreateWorkspace}
                disabled={
                  !workspace.name ||
                  (selectedCategory === 'Other' && !otherCategory) ||
                  !selectedCategory
                }
                className={`${currentTheme.primary} ${
                  currentTheme.hover
                } text-white px-6 py-2 rounded-lg font-medium transition-colors ${
                  !workspace.name ||
                  (selectedCategory === 'Other' && !otherCategory) ||
                  !selectedCategory
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                Create Workspace
              </button>
            </div>
          </div>
        );

      case OnboardingStep.COMPLETE:
        return (
          <div className='text-center'>
            <div
              className={`w-16 h-16 mx-auto rounded-full ${currentTheme.primary} flex items-center justify-center text-white mb-6`}
            >
              <CheckCircle size={32} />
            </div>
            <h2 className='text-2xl font-bold mb-4'>
              Workspace Created Successfully!
            </h2>
            <p className='text-gray-600 mb-8 max-w-lg mx-auto'>
              Your workspace "{workspace.name}" is ready. You can now start
              managing your field service operations.
            </p>
            <button
              onClick={() => (window.location.href = '/home')}
              className={`${currentTheme.primary} ${currentTheme.hover} text-white px-8 py-3 rounded-lg font-medium shadow-md transition-all`}
            >
              Go to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Header with branding */}
      <header className='bg-white border-b border-gray-200 py-4'>
        <div className='container mx-auto px-4 flex items-center'>
          <div
            className={`w-10 h-10 rounded ${currentTheme.primary} flex items-center justify-center text-white font-bold mr-3`}
          >
            FS
          </div>
          <h1 className='text-xl font-bold'>FieldService Pro</h1>
        </div>
      </header>

      {/* Main content */}
      <main className='flex-grow container mx-auto px-4 py-8'>
        {/* Progress indicator */}
        {currentStep !== OnboardingStep.COMPLETE && renderProgressSteps()}

        {/* Card container for current step */}
        <div className='bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto'>
          {renderStepContent()}
        </div>
      </main>
    </div>
  );
};

export default Workspace;
