import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import { AdminLogin } from './pages/AdminLogin'
import { AdminDashboard } from './pages/AdminDashboard'
import AdminForgotPassword from './pages/AdminForgotPassword'
import AdminResetPassword from './pages/AdminResetPassword'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Collections from './pages/Collections'
import Profile from './pages/Profile'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui/toast'
import { Outlet } from 'react-router-dom'
import './App.css'

function PublicLayout() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Admin Routes - No Navbar/Footer */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
              <Route path="/admin/reset-password" element={<AdminResetPassword />} />

              {/* Auth Routes - No Navbar/Footer */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Public Routes - With Navbar/Footer */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
