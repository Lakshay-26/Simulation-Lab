import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, ShieldCheck, Cpu, Terminal, 
  FileText, History, User, Settings, LogOut, Shield 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export const Sidebar = ({ isOpen, toggle }) => {
  const { user, logout, theme } = useAuth();

  const baseItems = [
    { name: 'Dashboard', path: '/', icon: Cpu },
    { name: 'Red Team', path: '/red-team', icon: Terminal },
    { name: 'Blue Team', path: '/blue-team', icon: ShieldAlert },
    { name: 'Security Tool', path: '/security-tool', icon: ShieldCheck },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const adminItems = [
    { name: 'Admin Hub', path: '/admin', icon: Shield }
  ];

  const menuItems = user?.role === 'admin' ? [...baseItems, ...adminItems] : baseItems;

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 border-r transition-transform duration-300 ${
        theme === 'dark'
          ? 'glassmorphism border-slate-800 text-slate-300'
          : 'light-glassmorphism border-slate-200 text-slate-600'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-inherit">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">
            SIMULATION LAB
          </span>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-4 h-[calc(100vh-8rem)] overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 768) toggle();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500 pl-3'
                  : 'hover:bg-slate-500/10 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-inherit">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
