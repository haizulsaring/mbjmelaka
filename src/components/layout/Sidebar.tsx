import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileCheck, 
  MessageSquare, 
  Megaphone, 
  Settings, 
  LogOut,
  User,
  Shield
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { t } = useLanguage();
  const { isAdmin, signOut, profile } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/meetings', icon: Calendar, label: t('nav.meetings') },
    { to: '/decisions', icon: FileCheck, label: t('nav.decisions') },
    { to: '/complaints', icon: MessageSquare, label: t('nav.complaints') },
    { to: '/announcements', icon: Megaphone, label: t('nav.announcements') },
  ];

  const adminItems = [
    { to: '/admin', icon: Shield, label: t('nav.admin') },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar flex flex-col z-40">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-xl">MBJ</span>
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-bold text-sm leading-tight">
              Portal Digital MBJ
            </h1>
            <p className="text-sidebar-foreground/60 text-xs">
              JPJ Negeri Melaka
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'nav-item',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Admin Section */}
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-sidebar-border">
            <p className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-3 px-4">
              {t('nav.admin')}
            </p>
            <ul className="space-y-1">
              {adminItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'nav-item',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="w-5 h-5 text-sidebar-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground text-sm font-medium truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-sidebar-foreground/60 text-xs truncate">
              {profile?.email}
            </p>
          </div>
        </div>
        
        <div className="space-y-1">
          <NavLink
            to="/profile"
            className={cn(
              'nav-item text-sm',
              location.pathname === '/profile'
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <Settings className="w-4 h-4" />
            <span>{t('nav.profile')}</span>
          </NavLink>
          
          <button
            onClick={() => signOut()}
            className="nav-item text-sm w-full text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
