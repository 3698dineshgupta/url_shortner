// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';
import Features from './pages/Features';
import Resources from './pages/Resources';
import Company from './pages/Company';
import Support from './pages/Support';
import Legal from './pages/Legal';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <div className="min-h-screen gradient-mesh">
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/analytics/:shortCode" element={<PrivateRoute><Analytics /></PrivateRoute>} />
      <Route path="/features" element={<Features />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/company" element={<Company />} />
      <Route path="/support" element={<Support />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    <Footer />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
