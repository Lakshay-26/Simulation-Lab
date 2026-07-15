import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ShieldCheck, ShieldAlert, Cpu, Terminal, RefreshCw, Calendar, CheckCircle2, AlertOctagon } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import dashboardBgDark from '../assets/images/dashboard_bg.png';
import dashboardBgLight from '../assets/images/dashboard_bg_light.png';

const MOCK_GRAPH_DATA = [
  { day: 'Mon', attempts: 12, blocked: 8 },
  { day: 'Tue', attempts: 19, blocked: 14 },
  { day: 'Wed', attempts: 15, blocked: 11 },
  { day: 'Thu', attempts: 22, blocked: 18 },
  { day: 'Fri', attempts: 30, blocked: 26 },
  { day: 'Sat', attempts: 8, blocked: 7 },
  { day: 'Sun', attempts: 14, blocked: 12 }
];

export const Dashboard = () => {
  const { user, theme } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/simulation/stats');
      setStats(response.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  const scoreColor = stats.securityScore >= 80 ? 'text-emerald-500' : (stats.securityScore >= 60 ? 'text-amber-500' : 'text-red-500');
  const strokeColor = stats.securityScore >= 80 ? '#10B981' : (stats.securityScore >= 60 ? '#F59E0B' : '#EF4444');

  return (
    <div
      style={{ backgroundImage: `url(${theme === 'dark' ? dashboardBgDark : dashboardBgLight})` }}
      className="relative min-h-[calc(100vh-4rem)] p-6 bg-cover bg-center bg-no-repeat bg-parallax transition-all duration-300"
    >
      <div className={`absolute inset-0 z-0 backdrop-blur-[2px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950/60' : 'bg-white/45'
      }`} />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">System Command</h1>
            <p className="text-xs text-slate-400 mt-1">Hello, Cadet {user?.username}. Main operational consoles online.</p>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium px-4 py-2 rounded-xl glassmorphism">
            <Calendar size={14} className="text-blue-500" />
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`p-6 rounded-3xl border shadow-xl flex items-center justify-between ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Score</span>
              <p className={`text-3xl font-extrabold ${scoreColor}`}>{stats.securityScore}%</p>
              <p className="text-[10px] text-slate-400">Target system health</p>
            </div>
            <div className="relative h-16 w-16">
              <svg className="h-full w-full -rotate-90">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke={theme === 'dark' ? '#1E293B' : '#E2E8F0'} strokeWidth="4" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="transparent"
                  stroke={strokeColor}
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - stats.securityScore / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl flex items-center justify-between ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Defenses</span>
              <p className="text-3xl font-extrabold text-blue-400">{stats.activeDefensesCount}</p>
              <p className="text-[10px] text-slate-400">Boundary shields enabled</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <ShieldCheck className="text-blue-500" size={24} />
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl flex items-center justify-between ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exploits Attempted</span>
              <p className="text-3xl font-extrabold text-red-500">{stats.completedSimulations}</p>
              <p className="text-[10px] text-slate-400">Vulnerabilities tested</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-2xl">
              <Terminal className="text-red-500" size={24} />
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl flex items-center justify-between ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Breaches Success</span>
              <p className="text-3xl font-extrabold text-amber-500">{stats.vulnerabilitiesFound}</p>
              <p className="text-[10px] text-slate-400">Unpatched exposures compromised</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <ShieldAlert className="text-amber-500" size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl space-y-4 ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Simulation Activity Charts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 text-center">Threat Attempts vs Blocks</p>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={MOCK_GRAPH_DATA}>
                    <defs>
                      <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#64748B" fontSize={10} />
                    <Tooltip contentStyle={{ background: theme === 'dark' ? '#0F172A' : '#FFFFFF', borderColor: '#334155' }} />
                    <Area type="monotone" dataKey="attempts" stroke="#EF4444" fillOpacity={1} fill="url(#colorAttempts)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 text-center">Defense Shields Success Rate</p>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={MOCK_GRAPH_DATA}>
                    <XAxis dataKey="day" stroke="#64748B" fontSize={10} />
                    <Tooltip contentStyle={{ background: theme === 'dark' ? '#0F172A' : '#FFFFFF', borderColor: '#334155' }} />
                    <Bar dataKey="blocked" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-6 ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Vulnerabilities Profile</h2>
            <div className="space-y-4">
              {[
                { name: 'Critical (SQLi)', count: stats.vulnerabilityStatistics?.critical || 0, color: 'bg-red-600', text: 'text-red-500' },
                { name: 'High (XSS / IDOR)', count: stats.vulnerabilityStatistics?.high || 0, color: 'bg-orange-500', text: 'text-orange-500' },
                { name: 'Medium (Config)', count: stats.vulnerabilityStatistics?.medium || 0, color: 'bg-yellow-500', text: 'text-yellow-500' },
                { name: 'Low / Info (Recon)', count: stats.vulnerabilityStatistics?.low || 0, color: 'bg-blue-500', text: 'text-blue-500' }
              ].map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">{item.name}</span>
                    <span className={item.text}>{item.count} Active</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${Math.min((item.count / 5) * 100, 100) || 5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-inherit flex items-center justify-between text-xs">
              <span className="text-slate-400">Shields Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold ${stats.toolStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {stats.toolStatus}
              </span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border shadow-xl space-y-6 ${
          theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
        }`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Activity Timeline Log</h2>
          <div className="flex flex-col gap-5 relative border-l border-slate-800 pl-4 ml-2">
            {stats.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500">No simulation logs registered in database.</p>
            ) : (
              stats.recentActivities.map((act) => (
                <div key={act.id || act._id} className="relative text-xs space-y-1">
                  <span className={`absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full border-2 ${
                    act.type === 'simulation' && act.severity === 'critical' ? 'bg-red-500 border-slate-950' :
                    act.type === 'defense' ? 'bg-blue-500 border-slate-950' : 'bg-emerald-500 border-slate-950'
                  }`} />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                      {act.type === 'simulation' ? <AlertOctagon size={12} className="text-red-500" /> : <CheckCircle2 size={12} className="text-blue-500" />}
                      <span>{act.action}</span>
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-400 pl-4">{act.module}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
