import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { History as HistoryIcon, Search, Trash, RotateCcw, Download, RefreshCw, Filter, SlidersHorizontal, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import historyBgDark from '../assets/images/history_bg.png';
import historyBgLight from '../assets/images/register_bg_light.png';

export const History = () => {
  const { theme } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('');
  const [sort, setSort] = useState('desc');
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [searchParams, type, severity, sort, showDeleted]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchParams(search ? { search } : {});
    }, 4000);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const urlSearch = searchParams.get('search') || '';
      const response = await api.get('/history', {
        params: {
          search: urlSearch,
          type,
          severity,
          sort,
          showDeleted
        }
      });
      setLogs(response.data.history || []);
    } catch (err) {
      showToast('Error fetching history logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setLogs((prev) => prev.filter((log) => log.id !== id && log._id !== id));
      showToast('Log item deleted (soft-deleted).', 'success');
    } catch (err) {
      showToast('Failed to delete log item.', 'error');
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.post(`/history/${id}/restore`);
      setLogs((prev) => prev.filter((log) => log.id !== id && log._id !== id));
      showToast('Log item restored successfully.', 'success');
    } catch (err) {
      showToast('Failed to restore log item.', 'error');
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get('/history/export', {
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'security_audit_history.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(response.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', 'security_audit_history.json');
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
      showToast(`History logs exported in ${format.toUpperCase()} format.`, 'success');
    } catch (err) {
      showToast('Failed to export history logs.', 'error');
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${theme === 'dark' ? historyBgDark : historyBgLight})` }}
      className="relative min-h-[calc(100vh-4rem)] p-6 bg-cover bg-center bg-no-repeat bg-parallax transition-all duration-300"
    >
      <div className={`absolute inset-0 z-0 backdrop-blur-[2px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950/60' : 'bg-white/45'
      }`} />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">System Logs & History</h1>
            <p className="text-xs text-slate-400 mt-1">Audit all user simulation, scan, login, and profile modification logs.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="relative col-span-1 lg:col-span-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search action logs..."
                className={`w-full py-2.5 pl-9 pr-4 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="">All Categories</option>
                <option value="simulation">Exploits</option>
                <option value="scan">Recon Scans</option>
                <option value="defense">Blue Team Toggle</option>
                <option value="report">PDF Reports</option>
                <option value="login">Sessions</option>
                <option value="profile">Profile Updates</option>
              </select>
            </div>

            <div>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950/50 text-blue-500 focus:ring-blue-500"
                />
                <span>Show Trash Bin</span>
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="animate-spin text-blue-500" size={28} />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs italic">No matching security logs discovered.</div>
        ) : (
          <div className={`p-6 rounded-3xl border shadow-xl overflow-hidden ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Log Category</th>
                    <th className="pb-3">Action Description</th>
                    <th className="pb-3">Severity</th>
                    <th className="pb-3">Module</th>
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id || log._id} className="border-b border-slate-800/30 hover:bg-slate-500/5 transition-colors">
                      <td className="py-4 font-semibold text-slate-200 capitalize flex items-center gap-2">
                        <HistoryIcon size={14} className="text-blue-500 shrink-0" />
                        <span>{log.type}</span>
                      </td>
                      <td className="py-4 text-slate-300 max-w-sm truncate">{log.action}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          log.severity === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          log.severity === 'high' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                          log.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400">{log.module}</td>
                      <td className="py-4 text-slate-500 font-medium">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-4 text-right">
                        {showDeleted ? (
                          <button
                            onClick={() => handleRestore(log.id || log._id)}
                            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                          >
                            <RotateCcw size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(log.id || log._id)}
                            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
