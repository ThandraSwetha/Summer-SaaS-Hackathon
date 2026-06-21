import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Briefcase, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold gradient-text hidden sm:block">Promtal Associates</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/jobs" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Find Jobs</Link>
            
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-4 border-l border-border pl-4">
                <Link to={`/${user?.role === 'super_admin' ? 'admin' : user?.role}/dashboard`} className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors">
                  <div className="bg-primary/20 p-1.5 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:block capitalize">{user?.role}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4 border-l border-border pl-4">
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Log in</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
