import { Navigate, Route, Routes } from 'react-router';
import 'leaflet/dist/leaflet.css';
import Signin from './pages/auth/Signin';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Home from './pages/Home';
import Calendar from './pages/calendar/Calendar';
import Customers from './pages/customers/Customers';
import Jobs from './pages/jobs/Jobs';
import Invoices from './pages/invoices/Invoices';
import CustomerDetails from './pages/customers/CustomerDetails';
import JobDetails from './pages/jobs/JobsDetails';
import Employees from './pages/employees/Employees';
import Dispatch from './pages/Dispatch';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Quotes from './pages/quotes/Quotes';
import Pricebook from './pages/pricebook/Pricebook';
import Marketing from './pages/Marketing';
import Settings from './pages/Settings';
import QuoteDetails from './pages/quotes/QuoteDetails';
import Workspace from './pages/Workspace';
import PrivateRoute from './utils/AuthHelpers/PrivateRoute';
import PublicRoute from './utils/AuthHelpers/PublicRoute';
import { useAuth } from './context/AuthProvider';
import RequireWorkspace from './utils/AuthHelpers/RequireWorkspace';
import InviteJoin from './pages/InviteJoin';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import InvoiceDetails from './pages/invoices/InvoiceDetails';
import ServiceItemDetails from './pages/pricebook/ServiceItemDetails';
import { Toaster } from 'react-hot-toast';
import ScreenLoader from './components/CustomElements/Loaders/ScreenLoader';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <ScreenLoader />;
  }

  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={<Navigate to='/home' replace />} />

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
          <Route path='workspace' element={<Workspace />} />

          <Route element={<RequireWorkspace />}>
            <Route path='home' element={<Home />} />
            <Route path='calendar' element={<Calendar />} />
            <Route path='customers' element={<Customers />} />
            <Route path='customers/:customerId' element={<CustomerDetails />} />
            <Route path='jobs' element={<Jobs />} />
            <Route path='jobs/:jobId' element={<JobDetails />} />
            <Route path='jobsd' element={<JobDetails />} />
            <Route path='invoices' element={<Invoices />} />
            <Route path='invoices/:invoiceId' element={<InvoiceDetails />} />
            <Route path='employees' element={<Employees />} />
            <Route path='employees/:employeeId' element={<EmployeeDetails />} />
            <Route path='dispatch' element={<Dispatch />} />
            <Route path='leads' element={<Leads />} />
            <Route path='leads/:leadId' element={<LeadDetails />} />
            <Route path='quotes' element={<Quotes />} />
            <Route path='quotes/:quoteId' element={<QuoteDetails />} />
            <Route path='pricebook' element={<Pricebook />} />
            <Route
              path='pricebook/:serviceItemId'
              element={<ServiceItemDetails />}
            />
            <Route path='marketing' element={<Marketing />} />
            <Route path='reports' element={<Marketing />} />
            <Route path='settings' element={<Settings />} />
            <Route path='support' element={<Settings />} />
          </Route>
        </Route>

        <Route path='*' element={<Navigate to='/home' replace />} />
      </Routes>
    </>
  );
}

export default App;
