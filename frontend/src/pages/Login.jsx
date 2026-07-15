import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import loginBgDark from '../assets/images/login_bg.png';
import loginBgLight from '../assets/images/login_bg_light.png';

export const Login = () => {
  const { login, theme } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    const success = await login(email, password, rememberMe);
    setLoading(false);
    if (success) {
      navigate('/');
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
          theme === 'dark' ? 'glassmorphism border-slate-800 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
        }`}>
          <div className="flex flex-col items-center mb-8">
            <div className="mb-3">
              <Logo size={52} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-center">Simulation Gateway</h1>
            <p className="text-xs text-slate-400 mt-1">Authenticate to access operations control</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className={`w-full py-3 pl-11 pr-4 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-950/50 border-slate-800 text-slate-200 focus:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-800 focus:border-slate-300'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full py-3 pl-11 pr-4 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-950/50 border-slate-800 text-slate-200 focus:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-800 focus:border-slate-300'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 font-medium cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950/50 text-blue-500 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-blue-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>

          <p className="mt-8 text-xs text-center text-slate-400">
            Authorized personnel only.{' '}
            <Link to="/register" className="text-blue-500 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
