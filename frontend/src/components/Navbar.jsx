import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, User, Menu, Settings, LogOut, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';

export const Navbar = ({ sidebarOpen, toggleSidebar }) => {
  const { user, theme, toggleTheme, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/history?limit=5');
      const logs = response.data.history || [];
      const notifs = logs.slice(0, 5).map(log => ({
        id: log.id || log._id,
        text: log.action,
        type: log.type,
        time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setNotifications(notifs);
    } catch (error) {
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/history?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-6 backdrop-blur-md transition-colors duration-300 ${
        theme === 'dark'
          ? 'glassmorphism border-slate-800 text-white'
          : 'light-glassmorphism border-slate-200 text-slate-800'
      }`}
    >
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-slate-400 hover:text-white md:hidden">
          <Menu size={24} />
        </button>
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="search"
            placeholder="Search reports, history, logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-64 rounded-xl py-2 pl-10 pr-4 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              theme === 'dark'
                ? 'bg-slate-950/50 border-slate-800 text-slate-200 placeholder-slate-500 focus:border-slate-700'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-300'
            }`}
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border hover:bg-slate-500/10 transition-colors ${
            theme === 'dark' ? 'border-slate-800 text-amber-400' : 'border-slate-200 text-indigo-600'
          }`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl border border-inherit hover:bg-slate-500/10 transition-colors"
          >
            <Bell size={20} className="text-slate-400 hover:text-inherit" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
          
          {notifOpen && (
            <div
              className={`absolute right-0 mt-3 w-80 rounded-2xl border p-4 shadow-2xl ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3">
                <span className="font-bold text-sm">Security Alerts</span>
                <span className="text-xs text-blue-500 hover:underline cursor-pointer" onClick={() => navigate('/history')}>
                  View all
                </span>
              </div>
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-4">No recent security alerts</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-2.5 text-xs">
                      {n.type === 'simulation' || n.type === 'scan' ? (
                        <ShieldAlert size={16} className="text-red-500 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium leading-normal">{n.text}</p>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
          >
            {user?.avatarUrl ? (
              <img
                src={`http://localhost:5000${user.avatarUrl}`}
                alt="Profile"
                className="h-9 w-9 rounded-full border border-blue-500 object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm border border-blue-500">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold leading-tight">{user?.username}</p>
              <span className="text-[10px] text-slate-400 capitalize">{user?.role}</span>
            </div>
          </button>

          {profileOpen && (
            <div
              className={`absolute right-0 mt-3 w-56 rounded-2xl border p-2 shadow-2xl ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-500/10 text-sm font-medium text-inherit text-left"
              >
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-500/10 text-sm font-medium text-inherit text-left"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <div className="h-px bg-inherit my-1" />
              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-rose-500/10 text-sm font-medium text-rose-500 text-left"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
