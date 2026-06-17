import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import StaffEntry from './pages/StaffEntry'
import BadgeLookup from './pages/BadgeLookup'
import SignUp from './pages/SignUp'
import ConfirmSignIn from './pages/ConfirmSignIn'
import SignOut from './pages/SignOut'
import Success from './pages/Success'
import VisitorFlow from './pages/VisitorFlow'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"                   element={<Home />} />
          <Route path="/staff"              element={<StaffEntry />} />
          <Route path="/staff/badge"        element={<BadgeLookup />} />
          <Route path="/staff/register"     element={<SignUp />} />
          <Route path="/staff/confirm"      element={<ConfirmSignIn />} />
          <Route path="/staff/signout"      element={<SignOut />} />
          <Route path="/visitor"            element={<VisitorFlow />} />
          <Route path="/admin/login"        element={<AdminLogin />} />
          <Route path="/admin/dashboard"    element={<AdminDashboard />} />
          <Route path="/success"            element={<Success />} />
          <Route path="*"                   element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
