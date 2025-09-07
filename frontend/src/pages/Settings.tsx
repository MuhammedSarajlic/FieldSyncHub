import React, { useState } from 'react';
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Smartphone,
  Globe,
  Users,
  Wrench,
  FileText,
  Calendar,
  DollarSign,
  Truck,
  MapPin,
  Clock,
  Mail,
  Phone,
  Printer,
  Database,
  Zap,
  BarChart3,
  Settings as SettingsIcon,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('company');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Company Settings
    companyName: 'ABC Service Company',
    businessType: 'plumbing',
    address: '123 Main St, City, State 12345',
    phone: '(555) 123-4567',
    email: 'contact@abcservice.com',
    website: 'www.abcservice.com',
    taxId: '12-3456789',

    // User Settings
    firstName: 'John',
    lastName: 'Smith',
    userEmail: 'john@abcservice.com',
    role: 'admin',
    timezone: 'America/New_York',

    // Billing Settings
    billingAddress: '123 Billing St, City, State 12345',
    paymentMethod: 'visa-1234',
    billingCycle: 'monthly',

    // Notifications
    emailNotifications: true,
    smsNotifications: true,
    jobAlerts: true,
    paymentAlerts: true,
    scheduleChanges: true,

    // Security
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',

    // Mobile Settings
    gpsTracking: true,
    offlineMode: true,
    photoCompression: 'medium',

    // Service Settings
    businessHours: {
      monday: { open: '08:00', close: '17:00', enabled: true },
      tuesday: { open: '08:00', close: '17:00', enabled: true },
      wednesday: { open: '08:00', close: '17:00', enabled: true },
      thursday: { open: '08:00', close: '17:00', enabled: true },
      friday: { open: '08:00', close: '17:00', enabled: true },
      saturday: { open: '09:00', close: '15:00', enabled: true },
      sunday: { open: '09:00', close: '15:00', enabled: false },
    },
    emergencyHours: true,
    bookingLeadTime: '2',
    maxJobsPerDay: '8',

    // Pricing
    taxRate: '8.5',
    currency: 'USD',
    defaultMarkup: '25',
    laborRate: '85',

    // Integrations
    quickbooks: false,
    googleCalendar: true,
    mailchimp: false,
    zapier: false,
    stripe: true,
  });

  const settingSections = [
    { id: 'company', name: 'Company Profile', icon: Building2 },
    { id: 'user', name: 'User Account', icon: User },
    { id: 'billing', name: 'Billing & Plans', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'mobile', name: 'Mobile App', icon: Smartphone },
    { id: 'service', name: 'Service Settings', icon: Wrench },
    { id: 'scheduling', name: 'Scheduling', icon: Calendar },
    { id: 'pricing', name: 'Pricing & Taxes', icon: DollarSign },
    { id: 'field', name: 'Field Operations', icon: Truck },
    { id: 'forms', name: 'Forms & Templates', icon: FileText },
    { id: 'integrations', name: 'Integrations', icon: Zap },
    { id: 'reports', name: 'Reports & Analytics', icon: BarChart3 },
    { id: 'system', name: 'System Preferences', icon: SettingsIcon },
  ];

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBusinessHourChange = (day, field, value) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  };

  const renderCompanySettings = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>Company Profile</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Company Name
          </label>
          <input
            type='text'
            value={settings.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Business Type
          </label>
          <select
            value={settings.businessType}
            onChange={(e) => handleInputChange('businessType', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='plumbing'>Plumbing</option>
            <option value='electrical'>Electrical</option>
            <option value='hvac'>HVAC</option>
            <option value='cleaning'>Cleaning</option>
            <option value='landscaping'>Landscaping</option>
            <option value='handyman'>Handyman</option>
            <option value='pest-control'>Pest Control</option>
            <option value='roofing'>Roofing</option>
          </select>
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Business Address
        </label>
        <input
          type='text'
          value={settings.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Phone Number
          </label>
          <input
            type='tel'
            value={settings.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Email Address
          </label>
          <input
            type='email'
            value={settings.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Website
          </label>
          <input
            type='url'
            value={settings.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Tax ID / EIN
          </label>
          <input
            type='text'
            value={settings.taxId}
            onChange={(e) => handleInputChange('taxId', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>
    </div>
  );

  const renderUserSettings = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>User Account</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            First Name
          </label>
          <input
            type='text'
            value={settings.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Last Name
          </label>
          <input
            type='text'
            value={settings.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Email Address
        </label>
        <input
          type='email'
          value={settings.userEmail}
          onChange={(e) => handleInputChange('userEmail', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Role
          </label>
          <select
            value={settings.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='admin'>Administrator</option>
            <option value='manager'>Manager</option>
            <option value='technician'>Technician</option>
            <option value='dispatcher'>Dispatcher</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='America/New_York'>Eastern Time</option>
            <option value='America/Chicago'>Central Time</option>
            <option value='America/Denver'>Mountain Time</option>
            <option value='America/Los_Angeles'>Pacific Time</option>
          </select>
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Change Password
        </label>
        <div className='relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='Enter new password'
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12'
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>
        Notification Preferences
      </h2>

      <div className='space-y-4'>
        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
          <div>
            <h3 className='font-medium text-gray-900'>Email Notifications</h3>
            <p className='text-sm text-gray-500'>Receive updates via email</p>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.emailNotifications}
              onChange={(e) =>
                handleInputChange('emailNotifications', e.target.checked)
              }
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
          <div>
            <h3 className='font-medium text-gray-900'>SMS Notifications</h3>
            <p className='text-sm text-gray-500'>
              Receive alerts via text message
            </p>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.smsNotifications}
              onChange={(e) =>
                handleInputChange('smsNotifications', e.target.checked)
              }
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
          <div>
            <h3 className='font-medium text-gray-900'>Job Alerts</h3>
            <p className='text-sm text-gray-500'>
              Get notified about new jobs and updates
            </p>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.jobAlerts}
              onChange={(e) => handleInputChange('jobAlerts', e.target.checked)}
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
          <div>
            <h3 className='font-medium text-gray-900'>Payment Alerts</h3>
            <p className='text-sm text-gray-500'>
              Notifications about payments and invoices
            </p>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.paymentAlerts}
              onChange={(e) =>
                handleInputChange('paymentAlerts', e.target.checked)
              }
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
          <div>
            <h3 className='font-medium text-gray-900'>Schedule Changes</h3>
            <p className='text-sm text-gray-500'>
              Alerts when appointments are modified
            </p>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.scheduleChanges}
              onChange={(e) =>
                handleInputChange('scheduleChanges', e.target.checked)
              }
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderServiceSettings = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>
        Service Settings
      </h2>

      <div>
        <h3 className='text-lg font-medium text-gray-900 mb-4'>
          Business Hours
        </h3>
        <div className='space-y-3'>
          {Object.entries(settings.businessHours).map(([day, hours]) => (
            <div
              key={day}
              className='flex items-center space-x-4 p-3 bg-gray-50 rounded-lg'
            >
              <div className='w-20'>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={hours.enabled}
                    onChange={(e) =>
                      handleBusinessHourChange(day, 'enabled', e.target.checked)
                    }
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className='w-24 capitalize font-medium text-gray-700'>
                {day}
              </div>
              <div className='flex items-center space-x-2'>
                <input
                  type='time'
                  value={hours.open}
                  onChange={(e) =>
                    handleBusinessHourChange(day, 'open', e.target.value)
                  }
                  disabled={!hours.enabled}
                  className='p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400'
                />
                <span className='text-gray-500'>to</span>
                <input
                  type='time'
                  value={hours.close}
                  onChange={(e) =>
                    handleBusinessHourChange(day, 'close', e.target.value)
                  }
                  disabled={!hours.enabled}
                  className='p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400'
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Booking Lead Time (hours)
          </label>
          <input
            type='number'
            value={settings.bookingLeadTime}
            onChange={(e) =>
              handleInputChange('bookingLeadTime', e.target.value)
            }
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Max Jobs Per Day
          </label>
          <input
            type='number'
            value={settings.maxJobsPerDay}
            onChange={(e) => handleInputChange('maxJobsPerDay', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>

      <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
        <div>
          <h3 className='font-medium text-gray-900'>Emergency Hours</h3>
          <p className='text-sm text-gray-500'>
            Accept emergency calls outside business hours
          </p>
        </div>
        <label className='relative inline-flex items-center cursor-pointer'>
          <input
            type='checkbox'
            checked={settings.emergencyHours}
            onChange={(e) =>
              handleInputChange('emergencyHours', e.target.checked)
            }
            className='sr-only peer'
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );

  const renderPricingSettings = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>Pricing & Taxes</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='USD'>USD - US Dollar</option>
            <option value='CAD'>CAD - Canadian Dollar</option>
            <option value='EUR'>EUR - Euro</option>
            <option value='GBP'>GBP - British Pound</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Tax Rate (%)
          </label>
          <input
            type='number'
            step='0.1'
            value={settings.taxRate}
            onChange={(e) => handleInputChange('taxRate', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Default Labor Rate (per hour)
          </label>
          <input
            type='number'
            value={settings.laborRate}
            onChange={(e) => handleInputChange('laborRate', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Default Markup (%)
          </label>
          <input
            type='number'
            value={settings.defaultMarkup}
            onChange={(e) => handleInputChange('defaultMarkup', e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>Integrations</h2>

      <div className='space-y-4'>
        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
              <Database className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h3 className='font-medium text-gray-900'>QuickBooks</h3>
              <p className='text-sm text-gray-500'>
                Sync invoices and payments
              </p>
            </div>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.quickbooks}
              onChange={(e) =>
                handleInputChange('quickbooks', e.target.checked)
              }
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
              <Calendar className='w-5 h-5 text-green-600' />
            </div>
            <div>
              <h3 className='font-medium text-gray-900'>Google Calendar</h3>
              <p className='text-sm text-gray-500'>
                Sync appointments and schedules
              </p>
            </div>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.googleCalendar}
              onChange={(e) =>
                handleInputChange('googleCalendar', e.target.checked)
              }
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
              <CreditCard className='w-5 h-5 text-purple-600' />
            </div>
            <div>
              <h3 className='font-medium text-gray-900'>Stripe</h3>
              <p className='text-sm text-gray-500'>
                Process payments and subscriptions
              </p>
            </div>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.stripe}
              onChange={(e) => handleInputChange('stripe', e.target.checked)}
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center'>
              <Zap className='w-5 h-5 text-orange-600' />
            </div>
            <div>
              <h3 className='font-medium text-gray-900'>Zapier</h3>
              <p className='text-sm text-gray-500'>
                Automate workflows with 3000+ apps
              </p>
            </div>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.zapier}
              onChange={(e) => handleInputChange('zapier', e.target.checked)}
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center'>
              <Mail className='w-5 h-5 text-yellow-600' />
            </div>
            <div>
              <h3 className='font-medium text-gray-900'>Mailchimp</h3>
              <p className='text-sm text-gray-500'>
                Email marketing and customer communications
              </p>
            </div>
          </div>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              type='checkbox'
              checked={settings.mailchimp}
              onChange={(e) => handleInputChange('mailchimp', e.target.checked)}
              className='sr-only peer'
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'company':
        return renderCompanySettings();
      case 'user':
        return renderUserSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'service':
        return renderServiceSettings();
      case 'pricing':
        return renderPricingSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      case 'billing':
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Billing & Plans
            </h2>
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200'>
              <h3 className='text-lg font-semibold text-blue-900 mb-2'>
                Professional Plan
              </h3>
              <p className='text-blue-700 mb-4'>
                $89/month • Up to 10 users • Unlimited jobs
              </p>
              <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
                Manage Subscription
              </button>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Billing Address
              </label>
              <input
                type='text'
                value={settings.billingAddress}
                onChange={(e) =>
                  handleInputChange('billingAddress', e.target.value)
                }
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>
        );
      case 'security':
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Security Settings
            </h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    Two-Factor Authentication
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Add an extra layer of security
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={settings.twoFactorAuth}
                    onChange={(e) =>
                      handleInputChange('twoFactorAuth', e.target.checked)
                    }
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Session Timeout (minutes)
                </label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    handleInputChange('sessionTimeout', e.target.value)
                  }
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='15'>15 minutes</option>
                  <option value='30'>30 minutes</option>
                  <option value='60'>1 hour</option>
                  <option value='120'>2 hours</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'mobile':
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Mobile App Settings
            </h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                <div>
                  <h3 className='font-medium text-gray-900'>GPS Tracking</h3>
                  <p className='text-sm text-gray-500'>
                    Track technician locations
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={settings.gpsTracking}
                    onChange={(e) =>
                      handleInputChange('gpsTracking', e.target.checked)
                    }
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Photo Compression
                </label>
                <select
                  value={settings.photoCompression}
                  onChange={(e) =>
                    handleInputChange('photoCompression', e.target.value)
                  }
                  className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='low'>
                    Low (Higher quality, more storage)
                  </option>
                  <option value='medium'>Medium (Balanced)</option>
                  <option value='high'>
                    High (Lower quality, less storage)
                  </option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'scheduling':
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Scheduling Preferences
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Default Appointment Duration
                </label>
                <select className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                  <option value='30'>30 minutes</option>
                  <option value='60'>1 hour</option>
                  <option value='90'>1.5 hours</option>
                  <option value='120'>2 hours</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Auto-assign Jobs
                </label>
                <select className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                  <option value='proximity'>By Proximity</option>
                  <option value='availability'>By Availability</option>
                  <option value='skills'>By Skills</option>
                  <option value='manual'>Manual Assignment</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'field':
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Field Operations
            </h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    Require Job Photos
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Technicians must take before/after photos
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input type='checkbox' className='sr-only peer' />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    Digital Signatures
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Require customer signatures for job completion
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    defaultChecked
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        );
      case 'forms':
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Forms & Templates
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='p-4 border border-gray-200 rounded-lg'>
                <h3 className='font-medium text-gray-900 mb-2'>
                  Service Agreement
                </h3>
                <p className='text-sm text-gray-500 mb-3'>
                  Standard terms and conditions
                </p>
                <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                  Edit Template
                </button>
              </div>
              <div className='p-4 border border-gray-200 rounded-lg'>
                <h3 className='font-medium text-gray-900 mb-2'>
                  Customer Satisfaction Survey
                </h3>
                <p className='text-sm text-gray-500 mb-3'>
                  Post-job feedback form
                </p>
                <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                  Edit Template
                </button>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Reports & Analytics
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Default Report Period
                </label>
                <select className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                  <option value='week'>Last 7 days</option>
                  <option value='month'>Last 30 days</option>
                  <option value='quarter'>Last 90 days</option>
                  <option value='year'>Last 365 days</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email Reports
                </label>
                <select className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                  <option value='none'>Never</option>
                  <option value='weekly'>Weekly</option>
                  <option value='monthly'>Monthly</option>
                  <option value='quarterly'>Quarterly</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'system':
        return (
          <div className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              System Preferences
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Date Format
                </label>
                <select className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                  <option value='MM/DD/YYYY'>MM/DD/YYYY</option>
                  <option value='DD/MM/YYYY'>DD/MM/YYYY</option>
                  <option value='YYYY-MM-DD'>YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Time Format
                </label>
                <select className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                  <option value='12'>12-hour (AM/PM)</option>
                  <option value='24'>24-hour</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return renderCompanySettings();
    }
  };

  return (
    <div className='flex h-screen'>
      {/* Sidebar placeholder */}
      <Sidebar />
      <div className='flex-1 ml-64'>
        {/* Navbar placeholder */}
        <Navbar />

        <div className='flex h-full'>
          {/* Settings Sidebar */}
          <div className='w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto'>
            <div className='space-y-1'>
              {settingSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className='w-5 h-5' />
                    <span className='font-medium'>{section.name}</span>
                    <ChevronRight className='w-4 h-4 ml-auto' />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1 p-8 overflow-y-auto'>
            <div className=''>
              {renderSectionContent()}

              {/* Save Button */}
              <div className='mt-8 pt-6 border-t border-gray-200'>
                <div className='flex items-center justify-end space-x-4'>
                  <button className='px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                    Cancel
                  </button>
                  <button className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'>
                    <Save className='w-4 h-4' />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
