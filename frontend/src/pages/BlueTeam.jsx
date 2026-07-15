import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, RefreshCw, Cpu, Activity } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import blueteamBgDark from '../assets/images/blue_team_bg.png';
import blueteamBgLight from '../assets/images/blue_team_bg_light.png';

const CONTROLS = [
  { key: 'parameterized_queries', name: 'Parameterized Queries', threat: 'SQL Injection', desc: 'Precompiles SQL directives to completely isolate commands from input data bindings.' },
  { key: 'input_validation', name: 'Input Validation', threat: 'SQLi & XSS', desc: 'Validates structure, types, formats, and ranges of input objects at the router entry.' },
  { key: 'output_encoding', name: 'Output Encoding', threat: 'Reflected XSS', desc: 'Converts input text (like HTML entities) before rendering to prevent scripting execution.' },
  { key: 'authorization', name: 'Authorization Checks', threat: 'IDOR & Access Leak', desc: 'Enforces object-level privileges checking that users own requested assets.' },
  { key: 'csrf_protection', name: 'CSRF Protection', threat: 'Session Hijacking', desc: 'Validates unique cryptographic session tokens to block cross-site execution hijacks.' },
  { key: 'rate_limiting', name: 'Rate Limiting', threat: 'DoS & Brute Force', desc: 'Restricts request volume counts per IP address to defend against brute force attempts.' },
  { key: 'helmet_security', name: 'Helmet Security Headers', threat: 'Headers Misconfig', desc: 'Automates deployment of recommended HTTP security header headers (XSS, CSP, Frame).' },
  { key: 'secure_cookies', name: 'Secure Cookie Policies', threat: 'Sensitive Data Exposure', desc: 'Sets HttpOnly, SameSite, and TLS Secure attributes on authorization cookies.' },
  { key: 'session_security', name: 'Session Management', threat: 'Session Overlays', desc: 'Invalidates session keys immediately upon logouts or after inactivity idle times.' },
  { key: 'password_policies', name: 'Password Complexity Rules', threat: 'Credential Stuffing', desc: 'Enforces strong entropy standards, length checks, and hashing during setups.' }
];

export const BlueTeam = () => {
  const { theme } = useAuth();
  const { showToast } = useToast();
  const [activeDefenses, setActiveDefenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDefenses();
  }, []);

  const fetchDefenses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/simulation/defenses');
      setActiveDefenses(response.data.activeDefenses || []);
    } catch (err) {
      showToast('Error syncing defensive state.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    try {
      const response = await api.post('/simulation/toggle-defense', { defenseKey: key });
      setActiveDefenses(response.data.activeDefenses);
      
      const isActiveNow = response.data.activeDefenses.includes(key);
      if (isActiveNow) {
        showToast(`Activated defensive control: ${key.replace(/_/g, ' ')}`, 'success');
      } else {
        showToast(`Deactivated defensive control: ${key.replace(/_/g, ' ')}`, 'warning');
      }
    } catch (err) {
      showToast('Failed to toggle defense.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  const score = 40 + activeDefenses.length * 6;
  const normalizedScore = Math.min(score, 100);

  return (
    <div
      style={{ backgroundImage: `url(${theme === 'dark' ? blueteamBgDark : blueteamBgLight})` }}
      className="relative min-h-[calc(100vh-4rem)] p-6 bg-cover bg-center bg-no-repeat bg-parallax transition-all duration-300"
    >
      <div className={`absolute inset-0 z-0 backdrop-blur-[2px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950/60' : 'bg-white/45'
      }`} />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Blue Team Operations (Defense)</h1>
            <p className="text-xs text-slate-400 mt-1">Configure mitigations and security rules to block injection exploits and lock threat surfaces.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl glassmorphism text-xs font-semibold text-white">
              <Cpu size={14} className="text-cyan-400" />
              <span>Safety Rating: <span className="text-cyan-400 font-extrabold">{normalizedScore}%</span></span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl glassmorphism text-xs font-semibold text-white">
              <Activity size={14} className="text-emerald-400 animate-pulse" />
              <span>Mitigated: <span className="text-emerald-400 font-extrabold">{activeDefenses.length} / {CONTROLS.length}</span></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONTROLS.map((ctrl) => {
            const isActive = activeDefenses.includes(ctrl.key);
            return (
              <div
                key={ctrl.key}
                className={`p-6 rounded-3xl border transition-all duration-300 shadow-lg flex flex-col justify-between h-[190px] ${
                  isActive
                    ? 'border-blue-500/40 bg-blue-950/20 text-white glow-cyan'
                    : theme === 'dark' ? 'glassmorphism border-slate-800 text-slate-300 hover:border-slate-700' : 'light-glassmorphism border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold">{ctrl.name}</h3>
                    <button
                      onClick={() => handleToggle(ctrl.key)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${
                        isActive ? 'bg-blue-600' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 mt-0.5 ${
                        isActive ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{ctrl.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-inherit/30 text-[9px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Target Threat:</span>
                  <span className={isActive ? 'text-blue-400' : 'text-rose-500'}>
                    {isActive ? 'Mitigated' : ctrl.threat}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
