const db = require('../config/db');

const DEFENSE_MITIGATIONS = {
  'SQLi': ['parameterized_queries', 'input_validation'],
  'XSS': ['xss_protection', 'output_encoding', 'input_validation'],
  'IDOR': ['authorization'],
  'Security Misconfiguration': ['helmet_security', 'secure_cookies'],
  'Sensitive Data Exposure': ['secure_cookies', 'session_security', 'password_policies']
};

const VULN_METADATA = {
  'SQLi': { severity: 'critical', score: 9.8 },
  'XSS': { severity: 'high', score: 8.2 },
  'IDOR': { severity: 'high', score: 8.5 },
  'Security Misconfiguration': { severity: 'medium', score: 5.3 },
  'Sensitive Data Exposure': { severity: 'high', score: 7.5 }
};

const getDefenses = async (req, res) => {
  try {
    const user = await db.User.findById(req.user.id);
    return res.status(200).json({ activeDefenses: user.activeDefenses || [] });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const toggleDefense = async (req, res) => {
  try {
    const { defenseKey } = req.body;
    if (!defenseKey) {
      return res.status(400).json({ message: 'Defense key is required' });
    }

    const user = await db.User.findById(req.user.id);
    let defenses = user.activeDefenses || [];
    let actionStr = '';
    let isActivated = false;

    if (defenses.includes(defenseKey)) {
      defenses = defenses.filter(d => d !== defenseKey);
      actionStr = `Deactivated defensive control: ${defenseKey.replace('_', ' ')}`;
    } else {
      defenses.push(defenseKey);
      actionStr = `Activated defensive control: ${defenseKey.replace('_', ' ')}`;
      isActivated = true;
    }

    await db.User.findByIdAndUpdate(req.user.id, { activeDefenses: defenses });

    await db.History.create({
      userId: req.user.id,
      type: 'defense',
      action: actionStr,
      module: 'Blue Team',
      severity: isActivated ? 'low' : 'warning',
      details: { defenseKey, active: isActivated }
    });

    return res.status(200).json({
      message: 'Defense toggled successfully',
      activeDefenses: defenses
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const runRecon = async (req, res) => {
  try {
    const { scanType } = req.body;
    if (!scanType) {
      return res.status(400).json({ message: 'Scan type is required' });
    }

    let output = [];
    let logMsg = '';

    switch (scanType) {
      case 'info_gathering':
        output = [
          '[*] Starting Information Gathering simulation...',
          '[*] Resolving target hostname...',
          '[+] Target IP: 192.168.1.105',
          '[+] NS Records: ns1.target.local, ns2.target.local',
          '[+] MX Records: mail.target.local (Priority: 10)',
          '[*] Querying WHOIS database...',
          '[+] Registrar: SafeDomain Inc.',
          '[+] Organization: Simulated Corp',
          '[+] Admin Email: security@target.local',
          '[+] Simulation complete. Data logged.'
        ];
        logMsg = 'Simulated Information Gathering scan';
        break;
      case 'port_scanning':
        output = [
          '[*] Launching SYN Port Scan simulation on 192.168.1.105...',
          '[*] Scanning 1000 common ports...',
          '[+] Port 22/tcp  [OPEN]  (SSH)',
          '[+] Port 80/tcp  [OPEN]  (HTTP)',
          '[+] Port 443/tcp [OPEN]  (HTTPS)',
          '[+] Port 3000/tcp [OPEN] (Node Express Dev)',
          '[+] Port 27017/tcp [OPEN] (MongoDB)',
          '[*] Scan finished. 5 open ports discovered.'
        ];
        logMsg = 'Simulated Port Scanning scan';
        break;
      case 'service_detection':
        output = [
          '[*] Identifying services on open ports...',
          '[+] 22/tcp  -> SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5',
          '[+] 80/tcp  -> nginx/1.18.0 (Ubuntu)',
          '[+] 443/tcp -> nginx/1.18.0 (Ubuntu) [SSL: TLSv1.3]',
          '[+] 3000/tcp -> Node.js (Express.js framework)',
          '[+] 27017/tcp -> MongoDB 5.0.6 (Protocol v1)',
          '[*] Service fingerprinting completed.'
        ];
        logMsg = 'Simulated Service Detection scan';
        break;
      case 'directory_enum':
        output = [
          '[*] Enumerating web directories with common wordlist (220 words)...',
          '[+] /index.html [200 OK]',
          '[+] /assets/ [200 OK]',
          '[+] /login [200 OK]',
          '[+] /admin/ [403 Forbidden]',
          '[+] /uploads/ [200 OK]',
          '[+] /config/ [200 OK] (Vulnerable directory exposure!)',
          '[+] /api/v1/ [200 OK]',
          '[*] Directory traversal complete.'
        ];
        logMsg = 'Simulated Directory Enumeration scan';
        break;
      case 'technology_detection':
        output = [
          '[*] Inspecting response headers and scripts...',
          '[+] Server: nginx/1.18.0',
          '[+] X-Powered-By: Express',
          '[+] Frontend Library: React (Vite)',
          '[+] Cookie Manager: express-session',
          '[+] Database: MongoDB (via Mongoose adapter)',
          '[*] Tech stack analysis finished.'
        ];
        logMsg = 'Simulated Technology Detection scan';
        break;
      default:
        return res.status(400).json({ message: 'Invalid scan type' });
    }

    await db.History.create({
      userId: req.user.id,
      type: 'scan',
      action: logMsg,
      module: 'Reconnaissance',
      severity: 'low',
      details: { scanType, output }
    });

    return res.status(200).json({ output });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const runExploit = async (req, res) => {
  try {
    const { vulnType, payload } = req.body;
    if (!vulnType || !payload) {
      return res.status(400).json({ message: 'Vulnerability type and payload are required' });
    }

    const user = await db.User.findById(req.user.id);
    const activeDefenses = user.activeDefenses || [];
    const mitigations = DEFENSE_MITIGATIONS[vulnType] || [];
    
    const isMitigated = mitigations.some(m => activeDefenses.includes(m));
    const metadata = VULN_METADATA[vulnType] || { severity: 'low', score: 4.0 };

    let outputLog = [];
    let success = false;

    if (isMitigated) {
      outputLog = [
        `[*] Target: http://192.168.1.105/api/vuln/${vulnType.toLowerCase().replace(' ', '')}`,
        `[*] Sending payload: ${payload}`,
        `[!] Threat Detected! Security control intercepted the request.`,
        `[+] Attack blocked by active defense: ${mitigations.filter(m => activeDefenses.includes(m)).join(', ').replace(/_/g, ' ')}`,
        `[+] DB query sanitized. Exiting safely.`
      ];
      success = false;

      await db.History.create({
        userId: req.user.id,
        type: 'simulation',
        action: `Blocked Red Team exploit: ${vulnType}`,
        module: 'Red Team',
        severity: 'low',
        details: { vulnType, payload, success: false, outputLog }
      });
    } else {
      outputLog = [
        `[*] Target: http://192.168.1.105/api/vuln/${vulnType.toLowerCase().replace(' ', '')}`,
        `[*] Sending payload: ${payload}`,
        `[+] Injecting exploit into vulnerable socket...`,
        `[+] Command executed successfully! Response received.`,
        `[!] System compromised. Sensitive response leaked.`
      ];
      success = true;

      await db.History.create({
        userId: req.user.id,
        type: 'simulation',
        action: `Executed Red Team exploit: ${vulnType}`,
        module: 'Red Team',
        severity: metadata.severity,
        details: { vulnType, payload, success: true, outputLog, score: metadata.score }
      });
    }

    return res.status(200).json({
      success,
      outputLog,
      severity: metadata.severity,
      score: metadata.score
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getStats = async (req, res) => {
  try {
    const user = await db.User.findById(req.user.id);
    const activeDefenses = user.activeDefenses || [];

    const baseScore = 40;
    const addedPoints = activeDefenses.length * 5;
    const securityScore = Math.min(baseScore + addedPoints, 100);

    const completedSimulations = await db.History.countDocuments({
      userId: req.user.id,
      type: 'simulation',
      isDeleted: { $ne: true }
    });

    const successfulExploits = await db.History.countDocuments({
      userId: req.user.id,
      type: 'simulation',
      'details.success': true,
      isDeleted: { $ne: true }
    });

    const activeDefensesCount = activeDefenses.length;

    const recentActivities = await db.History.find({
      userId: req.user.id,
      isDeleted: { $ne: true }
    });

    const sortedActivities = recentActivities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    const vulnCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    const simHistory = recentActivities.filter(h => h.type === 'simulation');
    simHistory.forEach(h => {
      if (h.details && h.details.success) {
        const sev = h.severity;
        if (vulnCounts[sev] !== undefined) {
          vulnCounts[sev]++;
        }
      }
    });

    return res.status(200).json({
      securityScore,
      completedSimulations,
      vulnerabilitiesFound: successfulExploits,
      activeDefensesCount,
      recentActivities: sortedActivities,
      vulnerabilityStatistics: vulnCounts,
      toolStatus: activeDefenses.includes('helmet_security') ? 'Active' : 'Unsecured'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getDefenses,
  toggleDefense,
  runRecon,
  runExploit,
  getStats
};
