import { Navigate, Route, Routes, useLocation } from 'react-router';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import Signin from './pages/auth/Signin';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ConfirmEmailChange from './pages/auth/ConfirmEmailChange';
import Home from './pages/Home';
import Calendar from './pages/calendar/Calendar';
import Customers from './pages/customers/Customers';
import Jobs from './pages/jobs/Jobs';
import Invoices from './pages/invoices/Invoices';
import CustomerDetails from './pages/customers/CustomerDetails';
import JobDetails from './pages/jobs/JobsDetails';
import Employees from './pages/employees/Employees';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Quotes from './pages/quotes/Quotes';
import Pricebook from './pages/pricebook/Pricebook';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import QuoteDetails from './pages/quotes/QuoteDetails';
import Workspace from './pages/Workspace';
import PrivateRoute from './utils/AuthHelpers/PrivateRoute';
import PublicRoute from './utils/AuthHelpers/PublicRoute';
import { useAuth } from './context/AuthProvider';
import RequireWorkspace from './utils/AuthHelpers/RequireWorkspace';
import RequireTwoFactorSetup from './utils/AuthHelpers/RequireTwoFactorSetup';
import InviteJoin from './pages/InviteJoin';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import InvoiceDetails from './pages/invoices/InvoiceDetails';
import ServiceItemDetails from './pages/pricebook/ServiceItemDetails';
import { Toaster } from 'react-hot-toast';
import ScreenLoader from './components/CustomElements/Loaders/ScreenLoader';

const getPageTitle = (pathname: string) => {
  if (pathname === '/' || pathname.startsWith('/home')) return 'Dashboard';
  if (pathname.startsWith('/calendar')) return 'Calendar';
  if (pathname.startsWith('/customers')) return 'Customers';
  if (pathname.startsWith('/jobs')) return 'Jobs';
  if (pathname.startsWith('/invoices')) return 'Invoices';
  if (pathname.startsWith('/employees')) return 'Team';
  if (pathname.startsWith('/leads')) return 'Leads';
  if (pathname.startsWith('/quotes')) return 'Quotes';
  if (pathname.startsWith('/pricebook')) return 'Pricebook';
  if (pathname.startsWith('/reports')) return 'Reports';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/workspace')) return 'Workspace setup';
  if (pathname.startsWith('/signin')) return 'Sign in';
  if (pathname.startsWith('/signup')) return 'Create account';
  if (pathname.startsWith('/forgot-password')) return 'Forgot password';
  if (pathname.startsWith('/reset-password')) return 'Reset password';
  if (pathname.startsWith('/invite')) return 'Join workspace';
  if (pathname.startsWith('/confirm-email-change')) return 'Confirm email change';
  return 'Page not found';
};

const RouteDocumentTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = `${getPageTitle(pathname)} | FieldSyncHub`;
  }, [pathname]);

  return null;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <ScreenLoader />;
  }

  return (
    <>
      <Toaster
        toastOptions={{
          ariaProps: {
            role: 'status',
            'aria-live': 'polite',
          },
          error: {
            ariaProps: {
              role: 'alert',
              'aria-live': 'assertive',
            },
          },
        }}
      />
      <a
        href='#main-content'
        className='sr-only fixed left-4 top-4 z-[100] rounded-md bg-bg-primary px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-bg-primary focus:ring-offset-2'
      >
        Skip to main content
      </a>
      <main id='main-content' tabIndex={-1} className='min-h-screen outline-none'>
        <RouteDocumentTitle />
        <Routes>
        <Route path='/' element={<Navigate to='/home' replace />} />
        <Route path='confirm-email-change' element={<ConfirmEmailChange />} />

        <Route element={<PublicRoute />}>
          <Route path='signin' element={<Signin />} />
          <Route path='signup' element={<Signup />} />
          <Route path='forgot-password' element={<ForgotPassword />} />
          <Route path='reset-password' element={<ResetPassword />} />
          <Route path='invite' element={<InviteJoin />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path='workspace' element={<Workspace />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<RequireWorkspace />}>
            <Route element={<RequireTwoFactorSetup />}>
              <Route path='home' element={<Home />} />
              <Route path='calendar' element={<Calendar />} />
              <Route path='customers' element={<Customers />} />
              <Route
                path='customers/:customerId'
                element={<CustomerDetails />}
              />
              <Route path='jobs' element={<Jobs />} />
              <Route path='jobs/:jobId' element={<JobDetails />} />
              <Route path='invoices' element={<Invoices />} />
              <Route
                path='invoices/:invoiceId'
                element={<InvoiceDetails />}
              />
              <Route path='employees' element={<Employees />} />
              <Route
                path='employees/:employeeId'
                element={<EmployeeDetails />}
              />
              <Route path='leads' element={<Leads />} />
              <Route path='leads/:leadId' element={<LeadDetails />} />
              <Route path='quotes' element={<Quotes />} />
              <Route path='quotes/:quoteId' element={<QuoteDetails />} />
              <Route path='pricebook' element={<Pricebook />} />
              <Route
                path='pricebook/:serviceItemId'
                element={<ServiceItemDetails />}
              />
              <Route path='reports' element={<Reports />} />
            </Route>
            {/* Outside the 2FA gate - an Owner who hasn't enrolled yet must
                still be able to reach the settings page that lets them. */}
            <Route path='settings' element={<Settings />} />
          </Route>
        </Route>

        <Route path='*' element={<div className='min-h-screen flex items-center justify-center'><div className='text-center'><h1 className='text-3xl font-bold'>Page not found</h1><a className='mt-4 inline-block text-blue-600' href='/home'>Return home</a></div></div>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
