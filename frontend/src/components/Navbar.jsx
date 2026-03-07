// components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Link2, BarChart2, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Link2 size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">snip</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-100 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all">
                <LayoutDashboard size={15} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <User size={14} className="text-sky-400" />
                <span className="text-sm text-slate-300 hidden sm:inline">{user?.username}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-400 hover:text-slate-100 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
