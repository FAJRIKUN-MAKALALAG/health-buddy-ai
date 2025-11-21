import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, MessageSquare, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              HealthyMe
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                className={cn(
                  isActive('/dashboard') && 'bg-gradient-primary text-white'
                )}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            
            <Link to="/chat">
              <Button
                variant={isActive('/chat') ? 'default' : 'ghost'}
                className={cn(
                  isActive('/chat') && 'bg-gradient-primary text-white'
                )}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat AI
              </Button>
            </Link>
            
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
