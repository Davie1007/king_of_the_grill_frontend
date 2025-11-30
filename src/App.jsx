import { HashRouter, Route, Routes } from 'react-router-dom';
import Butchery from "./pages/Butchery"
import Gas from "./pages/Gas"
import Drinks from "./pages/Drinks"
import OwnerDashboard from "./pages/OwnerDashboard"
import KenyaNewsPage from "./pages/News"
import ForgotPassword from "./pages/ForgotPasswordPage"
import ResetPassword from "./pages/ResetPasswordPage"
import ProfilePage from "./pages/ProfilePage"


const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/butchery" element={<Butchery/>} />
        <Route path="/gas" element={<Gas/>} />
        <Route path='/drinks' element={<Drinks/>} />
        <Route path='/owner_dashboard' element={<OwnerDashboard />} />
        <Route path="/news" element={<KenyaNewsPage/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path='/reset-password' element={<ResetPassword/>} />
        <Route path='/profile' element={<ProfilePage/>} />
      </Routes>
    </HashRouter>
  )
};

export default App;
