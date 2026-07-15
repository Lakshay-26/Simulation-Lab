import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Info, Loader } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import loginBgDark from '../assets/images/login_bg.png';
import loginBgLight from '../assets/images/login_bg_light.png';

export const ForgotPassword = () => {
  const { theme } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetLink('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      const token = response.data.resetToken;
      showToast('Password reset link generated!', 'success');
      setResetLink(`/reset-password?token=${token}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error requesting reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${theme === 'dark' ? loginBgDark : loginBgLight})` }}
      className="relative min-w-full min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-parallax transition-all duration-300"
    >
      <div className={`absolute inset-0 z-0 backdrop-blur-[2px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950/50' : 'bg-white/40'
      }`} />
      <div className="relative z-10 w-full max-w-md p-2">
        <div className={`p-8 rounded-3xl shadow-2xl border transition-all duration-300 ${
          theme === 'dark' ? 'glassmorphism border-slate-800 text-white' : 'light-glass-morphism border-slate-200 text-slate-800'
        }`}>
          <div className="flex flex-col items-center mb-8">
            <div className="mb-3">
              <Logo size={52} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-center">Recover Access</h1>
            <p className="text-xs text-slate-400 mt-1">Request a simulated credentials reset link</p>
          </div>

          {resetLink && (
            <div className="mb-6 p-4 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5"><Info size={16} /></span>
              <div>
                <p className="font-semibold">Reset Link Generated</p>
                <p className="mt-1 mb-2">Simulated link successfully sent to registration logs:</p>
                <Link to={resetLink} className="font-bold underline text-white hover:text-emerald-200 break-all">
                  Click here to Reset Password
                </Link>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cadet@simulation.net"
                  className={`w-full py-3 pl-11 pr-4 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-950/50 border-slate-800 text-slate-200 focus:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-800 focus:border-slate-300'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <span>Request Reset Link</span>
              )}
            </button>
          </form>

          <p className="mt-8 text-xs text-center text-slate-400">
            Back to{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login Gate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
