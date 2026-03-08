
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { currentUser, logout } = useAuth();
  return (
    <header className="h-14 border-b border-surface-200 bg-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-surface-100 rounded-md">
          <Menu size={20} className="text-surface-600" />
        </button>
        <h1 className="font-bold text-xl text-primary-600 flex items-center gap-2">
          <div className="w-6 h-6 bg-primary-500 rounded-sm"></div>
          Mini Project Manager
        </h1>
      </div>
      
      {currentUser && (
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-surface-600">
            <User size={16} />
            {currentUser.displayName || currentUser.email}
          </div>
          <button 
            onClick={() => logout()}
            className="p-2 hover:bg-surface-100 rounded-md text-surface-600 transition-colors"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      )}
    </header>
  );
}
