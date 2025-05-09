import { Route, Routes } from 'react-router';
import Signin from './pages/auth/Signin';
import Signup from './pages/auth/Signup';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Customers from './pages/customers/Customers';
import Jobs from './pages/jobs/Jobs';
import Invoices from './pages/Invoices';
import CustomerDetails from './pages/customers/CustomerDetails';
import JobDetails from './pages/jobs/JobsDetails';
import Employees from './pages/Employees';
import Dispatch from './pages/Dispatch';
import Requests from './pages/Requests';
import Quotes from './pages/quotes/Quotes';
import Pricebook from './pages/Pricebook';
import Marketing from './pages/Marketing';
import Settings from './pages/Settings';
import QuoteDetails from './pages/quotes/QuoteDetails';

function App() {
  return (
    <Routes>
      <Route path='signin' element={<Signin />} />
      <Route path='signup' element={<Signup />} />
      <Route path='home' element={<Home />} />
      <Route path='calendar' element={<Calendar />} />
      <Route path='customers' element={<Customers />} />
      <Route path='customers/:customerId' element={<CustomerDetails />} />
      <Route path='jobs' element={<Jobs />} />
      <Route path='jobsd' element={<JobDetails />} />
      <Route path='invoices' element={<Invoices />} />
      <Route path='employees' element={<Employees />} />
      <Route path='dispatch' element={<Dispatch />} />
      <Route path='requests' element={<Requests />} />
      <Route path='quotes' element={<Quotes />} />
      <Route path='quotesd' element={<QuoteDetails />} />
      <Route path='pricebook' element={<Pricebook />} />
      <Route path='marketing' element={<Marketing />} />
      <Route path='settings' element={<Settings />} />
    </Routes>
  );
}

export default App;
