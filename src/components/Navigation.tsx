import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, MessageSquare, LogOut, User, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/input', label: 'Input Data', icon: PlusCircle },
    { path: '/chat', label: 'Chat AI', icon: MessageSquare },
    { path: '/profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              HealthyMe
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    className={cn(
                      'transition-all',
                      isActive(item.path) && 'bg-gradient-primary text-white shadow-glow'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            <Button variant="ghost" onClick={signOut} className="hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
