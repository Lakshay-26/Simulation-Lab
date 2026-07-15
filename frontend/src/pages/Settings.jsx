import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Bell, Shield, Trash2, Globe, HelpCircle } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import settingsBgDark from '../assets/images/settings_bg.png';
import settingsBgLight from '../assets/images/login_bg_light.png';

export const Settings = () => {
  const { theme, toggleTheme, logout } = useAuth();
  const { showToast } = useToast();
  const [lang, setLang] = useState('en');
  const [notifConfig, setNotifConfig] = useState({ email: true, push: false, alerts: true });
  const [privacyConfig, setPrivacyConfig] = useState({ logging: true, profileVisible: true });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/delete-account');
      showToast('Your account was successfully deleted.', 'info');
      logout();
    } catch (err) {
      showToast('Failed to delete account.', 'error');
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${theme === 'dark' ? settingsBgDark : settingsBgLight})` }}
      className="relative min-h-[calc(100vh-4rem)] p-6 bg-cover bg-center bg-no-repeat bg-parallax transition-all duration-300"
    >
      <div className={`absolute inset-0 z-0 backdrop-blur-[2px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950/60' : 'bg-white/45'
      }`} />
      <div className="relative z-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Manage system configurations, localization parameters, and privacy policies.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/50">
              <Sun size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Appearance Theme</h2>
            </div>
            <div className="flex items-center justify-between text-xs pt-2">
              <div>
                <p className="font-bold">Visual Mode</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Toggle between dark cyberpunk and bright modes</p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 transition-all"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/50">
              <Globe size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Localization</h2>
            </div>
            <div className="flex items-center justify-between text-xs pt-2">
              <div>
                <p className="font-bold">System Language</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Configure dashboard language</p>
              </div>
              <select
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value);
                  showToast('Language settings saved.', 'success');
                }}
                className={`py-2 px-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="en">English (US)</option>
                <option value="es">Español (ES)</option>
                <option value="de">Deutsch (DE)</option>
                <option value="fr">Français (FR)</option>
              </select>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/50">
              <Bell size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Notification Alerts</h2>
            </div>
            <div className="space-y-4 pt-2">
              {[
                { key: 'email', title: 'Email Alerts', desc: 'Receive audit summaries on registered mailbox' },
                { key: 'push', title: 'Desktop Push', desc: 'Enable native in-app security notifications' },
                { key: 'alerts', title: 'Simulation Warnings', desc: 'Receive real-time threat breach alarms' }
              ].map((item) => (
                <label key={item.key} className="flex items-start justify-between text-xs cursor-pointer">
                  <div className="max-w-xs">
                    <p className="font-bold">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifConfig[item.key]}
                    onChange={(e) => setNotifConfig({ ...notifConfig, [item.key]: e.target.checked })}
                    className="rounded border-slate-800 bg-slate-950/50 text-blue-500 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/50">
              <Shield size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Privacy & Audits</h2>
            </div>
            <div className="space-y-4 pt-2">
              {[
                { key: 'logging', title: 'Activity Logging', desc: 'Record all local console scans and exploit metrics in history' },
                { key: 'profileVisible', title: 'Profile Visibility', desc: 'Allow course instructors to audit your security scores' }
              ].map((item) => (
                <label key={item.key} className="flex items-start justify-between text-xs cursor-pointer">
                  <div className="max-w-xs">
                    <p className="font-bold">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyConfig[item.key]}
                    onChange={(e) => setPrivacyConfig({ ...privacyConfig, [item.key]: e.target.checked })}
                    className="rounded border-slate-800 bg-slate-950/50 text-blue-500 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-3xl border border-red-500/20 bg-red-500/5 shadow-xl space-y-4 lg:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 size={14} />
                <span>Danger Zone</span>
              </h2>
              <p className="text-[10px] text-slate-400 max-w-xl leading-normal">Deleting your account is permanent. This operation will purge your profile, remove all generated PDF reports from disk, clear the database audit logs, and clear sessions.</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="py-2.5 px-6 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-lg hover:shadow-red-500/25 transition-all self-start sm:self-center shrink-0"
            >
              Purge Account
            </button>
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`p-6 rounded-3xl max-w-sm w-full border text-center space-y-5 ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="mx-auto w-fit p-3 bg-red-500/10 rounded-full text-red-500">
                <HelpCircle size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Purge Account Permanently?</h3>
                <p className="text-[10px] text-slate-400 leading-normal">This action is irreversible. All generated report files and logs will be deleted from disk.</p>
              </div>
              <div className="flex gap-3 justify-center text-xs">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`px-4 py-2 rounded-xl font-bold border ${
                    theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
