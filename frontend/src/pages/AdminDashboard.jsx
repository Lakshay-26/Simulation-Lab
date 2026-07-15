import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, Shield, FileText, Trash2, CheckCircle2, History } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import dashboardBgDark from '../assets/images/dashboard_bg.png';
import dashboardBgLight from '../assets/images/dashboard_bg_light.png';

export const AdminDashboard = () => {
  const { theme } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, logsRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/logs'),
        api.get('/admin/analytics')
      ]);
      setUsers(usersRes.data.users || []);
      setLogs(logsRes.data.logs || []);
      setAnalytics(statsRes.data.analytics || null);
    } catch (err) {
      showToast('Error syncing administrative data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      showToast('User role updated successfully.', 'success');
    } catch (err) {
      showToast('Failed to update user role.', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast('User account successfully purged.', 'success');
    } catch (err) {
      showToast('Failed to delete user account.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div
      style={{ backgroundImage: `url(${theme === 'dark' ? dashboardBgDark : dashboardBgLight})` }}
      className="relative min-h-[calc(100vh-4rem)] p-6 bg-cover bg-center bg-no-repeat bg-parallax transition-all duration-300"
    >
      <div className={`absolute inset-0 z-0 backdrop-blur-[2px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950/60' : 'bg-white/45'
      }`} />
      <div className="relative z-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Administrative Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">Manage user profiles, change course permissions, and check server traffic logs.</p>
        </div>

        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-5 rounded-3xl border shadow-lg flex items-center justify-between ${
              theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enlisted</span>
                <p className="text-2xl font-extrabold text-blue-400">{analytics.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-2xl"><Users size={20} className="text-blue-500" /></div>
            </div>

            <div className={`p-5 rounded-3xl border shadow-lg flex items-center justify-between ${
              theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Audits</span>
                <p className="text-2xl font-extrabold text-red-500">{analytics.totalReports}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-2xl"><FileText size={20} className="text-red-500" /></div>
            </div>

            <div className={`p-5 rounded-3xl border shadow-lg flex items-center justify-between ${
              theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Threat Exploits</span>
                <p className="text-2xl font-extrabold text-amber-500">{analytics.totalSimulations}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-2xl"><History size={20} className="text-amber-500" /></div>
            </div>

            <div className={`p-5 rounded-3xl border shadow-lg flex items-center justify-between ${
              theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Defenses</span>
                <p className="text-2xl font-extrabold text-emerald-400">{analytics.totalDefenses}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl"><Shield size={20} className="text-emerald-400" /></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl space-y-4 ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">User Directory</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Cadet</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Course Role</th>
                    <th className="pb-3">Enlisted Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-800/30 hover:bg-slate-500/5 transition-colors">
                      <td className="py-4 font-semibold text-slate-200 flex items-center gap-2">
                        {u.avatarUrl ? (
                          <img
                            src={`http://localhost:5000${u.avatarUrl}`}
                            alt={u.username}
                            className="h-7 w-7 rounded-full object-cover border border-slate-800"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{u.username}</span>
                      </td>
                      <td className="py-4 text-slate-300">{u.email}</td>
                      <td className="py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={`py-1 px-2.5 rounded-lg border text-[11px] focus:outline-none font-bold capitalize ${
                            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <option value="student">Student</option>
                          <option value="analyst">Analyst</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td className="py-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Server Auditing Logs</h2>
            <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">No request logs registered.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id || log._id} className="p-3 bg-black/30 border border-slate-800/60 rounded-2xl text-[10px] space-y-1.5 font-mono leading-relaxed select-text">
                    <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/50 pb-1.5">
                      <span className="text-blue-400 font-bold">{log.method} {log.route}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 text-[9px]"><span className="text-slate-500">Host IP:</span> {log.ipAddress}</p>
                    <p className="text-slate-500 text-[8px] truncate">{log.userAgent}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
