import { Route, Routes } from 'react-router';
import Signin from './pages/auth/Signin';
import Signup from './pages/auth/Signup';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Customers from './pages/customers/Customers';
import Jobs from './pages/Jobs';
import Invoices from './pages/Invoices';
import CustomerDetails from './pages/customers/CustomerDetails';

function App() {
  return (
    <Routes>
      <Route path='signin' element={<Signin />} />
      <Route path='signup' element={<Signup />} />
      <Route path='home' element={<Home />} />
      <Route path='calendar' element={<Calendar />} />
      <Route path='customers' element={<Customers />} />
      <Route path='customers/customerId' element={<CustomerDetails />} />
      <Route path='jobs' element={<Jobs />} />
      <Route path='invoices' element={<Invoices />} />
    </Routes>
  );
}

export default App;
