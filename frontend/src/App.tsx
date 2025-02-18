import Signin from './pages/Signin';
import { Route, Routes } from 'react-router';
import Signup from './pages/Signup';

function App() {
  return (
    <Routes>
      <Route path='signin' element={<Signin />} />
      <Route path='signup' element={<Signup />} />
    </Routes>
  );
}

export default App;
