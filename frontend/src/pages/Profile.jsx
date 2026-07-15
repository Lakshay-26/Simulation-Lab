import React, { useState } from 'react';
import { User, Mail, Phone, BookOpen, Lock, Shield, Loader, Camera } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import profileBgDark from '../assets/images/profile_bg.png';
import profileBgLight from '../assets/images/login_bg_light.png';

export const Profile = () => {
  const { user, theme, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ? `http://localhost:5000${user.avatarUrl}` : null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('phone', phone);
    formData.append('bio', bio);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    await updateProfile(formData);
    setProfileLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${theme === 'dark' ? profileBgDark : profileBgLight})` }}
      className="relative min-h-[calc(100vh-4rem)] p-6 bg-cover bg-center bg-no-repeat bg-parallax transition-all duration-300"
    >
      <div className={`absolute inset-0 z-0 backdrop-blur-[2px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950/60' : 'bg-white/45'
      }`} />
      <div className="relative z-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Profile Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">Configure your personal security account profile details and login credentials.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border shadow-xl flex flex-col items-center text-center gap-4 h-fit ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <div className="relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-28 w-28 rounded-full border-2 border-blue-500 object-cover"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-3xl border-2 border-blue-500">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 transition-colors shadow-lg border border-slate-950">
                <Camera size={14} className="text-white" />
                <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
              </label>
            </div>
            <div>
              <h2 className="text-base font-bold">{user?.username}</h2>
              <p className="text-xs text-slate-400 leading-normal mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-1.5 justify-center mt-2.5">
                <Shield size={12} className="text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">{user?.role}</span>
              </div>
            </div>
            {user?.bio && (
              <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed italic border-t border-slate-800/50 pt-4 w-full">
                "{user.bio}"
              </p>
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
              theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Account Details</h2>
              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full py-2.5 pl-9 pr-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Contact</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone size={14} />
                    </span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full py-2.5 pl-9 pr-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cadet Bio</label>
                  <div className="relative">
                    <span className="absolute top-3 left-3 text-slate-400">
                      <BookOpen size={14} />
                    </span>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className={`w-full py-2.5 pl-9 pr-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                  >
                    {profileLoading && <Loader className="animate-spin" size={14} />}
                    <span>Update Account Info</span>
                  </button>
                </div>
              </form>
            </div>

            <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
              theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Security Credentials</h2>
              <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full py-2.5 pl-9 pr-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full py-2.5 pl-9 pr-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={14} />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full py-2.5 pl-9 pr-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="py-2.5 px-6 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2"
                  >
                    {passwordLoading && <Loader className="animate-spin" size={14} />}
                    <span>Update Security Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
