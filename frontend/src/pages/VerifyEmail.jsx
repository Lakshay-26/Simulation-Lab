import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Info, Loader } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import registerBgDark from '../assets/images/register_bg.png';
import registerBgLight from '../assets/images/register_bg_light.png';

export const VerifyEmail = () => {
  const { theme } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userId = location.state?.userId;
  const simulatedCode = location.state?.code;

  useEffect(() => {
    if (!userId) {
      showToast('Session expired. Please register again.', 'error');
      navigate('/register');
    }
  }, [userId, navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!code) {
      setError('Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', { userId, code });
      showToast('Email verified successfully! You can now log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${theme === 'dark' ? registerBgDark : registerBgLight})` }}
      className="relative min-w-full min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-parallax transition-all duration-300"
    >
      <div className={`absolute inset-0 z-0 backdrop-blur-[2px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950/50' : 'bg-white/40'
      }`} />
      <div className="relative z-10 w-full max-w-md p-2">
        <div className={`p-8 rounded-3xl shadow-2xl border transition-all duration-300 ${
          theme === 'dark' ? 'glassmorphism border-slate-800 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
        }`}>
          <div className="flex flex-col items-center mb-8">
            <div className="mb-3">
              <Logo size={52} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-center">Verify Email</h1>
            <p className="text-xs text-slate-400 mt-1">Enter the 6-digit security code</p>
          </div>

          {simulatedCode && (
            <div className="mb-6 p-4 rounded-xl text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5"><Info size={16} /></span>
              <div>
                <p className="font-semibold">Simulated Email Delivery</p>
                <p className="mt-1">For testing, copy this validation code: <span className="font-bold underline text-white select-all">{simulatedCode}</span></p>
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className={`w-full py-3 text-center tracking-[0.5em] text-lg font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-950/50 border-slate-800 text-slate-200 focus:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-800 focus:border-slate-300'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <span>Verify Code</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
