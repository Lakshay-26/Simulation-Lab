import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash, RefreshCw, Plus, CheckCircle, Loader } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import reportsBgDark from '../assets/images/reports_bg.png';
import reportsBgLight from '../assets/images/dashboard_bg_light.png';

export const Reports = () => {
  const { theme, user } = useAuth();
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [studentName, setStudentName] = useState(user?.username || 'Lakshay');
  const [reportType, setReportType] = useState('attack');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports');
      setReports(response.data.reports || []);
    } catch (err) {
      showToast('Error loading reports database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      showToast('Please enter candidate name.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await api.post('/reports/generate', { studentName, type: reportType });
      showToast(response.data.message || 'Report generated successfully!', 'success');
      setReports((prev) => [response.data.report, ...prev]);
    } catch (err) {
      showToast('Failed to compile security report.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reports/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id && r._id !== id));
      showToast('Report deleted successfully (soft-deleted).', 'success');
    } catch (err) {
      showToast('Failed to delete report.', 'error');
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
      style={{ backgroundImage: `url(${theme === 'dark' ? reportsBgDark : reportsBgLight})` }}
      className="relative min-h-[calc(100vh-4rem)] p-6 bg-cover bg-center bg-no-repeat bg-parallax transition-all duration-300"
    >
      <div className={`absolute inset-0 z-0 backdrop-blur-[2px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950/60' : 'bg-white/45'
      }`} />
      <div className="relative z-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Security Audits & Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Compile and download professional, publication-ready PDF security reports based on your simulation history.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border shadow-xl h-fit space-y-4 ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Compile New Report</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student/Candidate Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Category</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="attack">Red Team (Attack Report)</option>
                  <option value="defense">Blue Team (Defense Report)</option>
                  <option value="final">Final Report (Combined Report)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                {submitLoading ? <Loader className="animate-spin" size={16} /> : <Plus size={14} />}
                <span>Generate Audit PDF</span>
              </button>
            </form>
          </div>

          <div className={`lg:col-span-2 p-6 rounded-3xl border shadow-xl space-y-6 ${
            theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
          }`}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Report Vault</h2>
            {reports.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic">No reports generated yet. Use the compiler panel.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Title</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Candidate</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id || report._id} className="border-b border-slate-800/30 hover:bg-slate-500/5 transition-colors">
                        <td className="py-4 font-semibold text-slate-200 flex items-center gap-2">
                          <FileText size={16} className="text-red-500" />
                          <span>{report.title}</span>
                        </td>
                        <td className="py-4 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            report.type === 'attack' ? 'bg-red-500/10 text-red-400' : (report.type === 'defense' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400')
                          }`}>
                            {report.type}
                          </span>
                        </td>
                        <td className="py-4 text-slate-300">{report.studentName}</td>
                        <td className="py-4 text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <a
                              href={`http://localhost:5000${report.pdfPath}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
                            >
                              <Download size={14} />
                            </a>
                            <button
                              onClick={() => handleDelete(report.id || report._id)}
                              className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
