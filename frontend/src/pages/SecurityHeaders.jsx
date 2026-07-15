import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Search, Loader, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import securitytoolBgDark from '../assets/images/security_tool_bg.png';
import securitytoolBgLight from '../assets/images/blue_team_bg_light.png';

export const SecurityHeaders = () => {
  const { theme } = useAuth();
  const { showToast } = useToast();
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!urlInput.trim()) {
      setError('Please enter a target URL');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/analyzer/analyze', { url: urlInput });
      setResult(response.data);
      showToast(`Scan complete for ${response.data.host}`, 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan target headers. Check server logs.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (grade.startsWith('B')) return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
    if (grade.startsWith('C')) return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    return 'text-red-500 border-red-500/30 bg-red-500/10';
  };

  return (
    <div
      style={{ backgroundImage: `url(${theme === 'dark' ? securitytoolBgDark : securitytoolBgLight})` }}
      className="relative min-h-[calc(100vh-4rem)] p-6 bg-cover bg-center bg-no-repeat bg-parallax transition-all duration-300"
    >
      <div className={`absolute inset-0 z-0 backdrop-blur-[2px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950/60' : 'bg-white/45'
      }`} />
      <div className="relative z-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Security Headers Analyzer</h1>
          <p className="text-xs text-slate-400 mt-1">Audit HTTP security headers on external endpoints or local loopbacks to verify secure configuration states.</p>
        </div>

        <form onSubmit={handleScan} className="max-w-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://secure-portal.local"
                className={`w-full py-3.5 pl-11 pr-4 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-950/50 border-slate-800 text-slate-200 focus:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-800 focus:border-slate-300'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3.5 px-8 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
              <span>Inspect Headers</span>
            </button>
          </div>
          {error && <p className="text-xs text-rose-400 mt-2 font-semibold">{error}</p>}
        </form>

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col items-center justify-center text-center gap-4 h-64 lg:h-auto ${
              theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Grade</span>
              <div className={`h-24 w-24 rounded-full border-2 flex items-center justify-center text-3xl font-black ${getGradeColor(result.grade)}`}>
                {result.grade}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Score Rating: <span className="text-white">{result.score}%</span></p>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">Checked host: {result.host}</p>
              </div>
            </div>

            <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl space-y-6 ${
              theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Header Inspection Report</h2>
              <div className="flex flex-col gap-4">
                {result.findings.map((f, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-800/50 bg-slate-900/10 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {f.present ? (
                          <CheckCircle className="text-emerald-400 shrink-0" size={16} />
                        ) : (
                          <ShieldAlert className="text-rose-500 shrink-0" size={16} />
                        )}
                        <span className="text-xs font-bold">{f.header}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${f.present ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {f.present ? 'Secure' : 'Missing'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">{f.description}</p>
                    {!f.present && (
                      <div className="p-2.5 bg-rose-500/5 rounded-xl border border-rose-500/10 mt-2 text-[10px] text-rose-300">
                        <span className="font-bold">Mitigation:</span> {f.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
