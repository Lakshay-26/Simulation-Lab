import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import registerBgDark from '../assets/images/register_bg.png';
import registerBgLight from '../assets/images/register_bg_light.png';

export const Register = () => {
  const { register, theme } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (!password) return { text: '', color: 'bg-slate-800' };
    if (password.length < 6) return { text: 'Weak', color: 'bg-red-500 w-1/3' };
    if (password.length < 10) return { text: 'Medium', color: 'bg-yellow-500 w-2/3' };
    return { text: 'Strong', color: 'bg-emerald-500 w-full' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);
    
    if (result) {
      navigate('/verify-email', { state: { userId: result.userId, code: result.verificationToken } });
    }
  };

  const strength = getPasswordStrength();

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
            <h1 className="text-2xl font-bold tracking-tight text-center">Enlist Cadet</h1>
            <p className="text-xs text-slate-400 mt-1">Register to start your cybersecurity labs</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="hacker101"
                  className={`w-full py-3 pl-11 pr-4 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-950/50 border-slate-800 text-slate-200 focus:border-slate-700'
                      : 'bg-white border-slate-200 text-slate-800 focus:border-slate-300'
                  }`}
                />
              </div>
            </div>

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
                  placeholder="cadet@simulation.net"
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
              
              {password && (
                <div className="pt-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                    <span>Password Strength</span>
                    <span className="font-semibold">{strength.text}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color}`} />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          <p className="mt-8 text-xs text-center text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Access login gateway
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
