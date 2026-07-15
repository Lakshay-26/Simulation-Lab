const db = require('../config/db');
const pdfService = require('../services/pdfService');

const generateReport = async (req, res) => {
  try {
    const { studentName, type } = req.body;
    if (!studentName || !type) {
      return res.status(400).json({ message: 'Student name and report type are required' });
    }

    const histories = await db.History.find({ userId: req.user.id, isDeleted: { $ne: true } });
    const activeDefenses = req.user.activeDefenses || [];

    let summary = '';
    let findings = [];
    let recommendations = [];

    if (type === 'attack') {
      summary = `This Attack Report documents the reconnaissance scans and vulnerability exploits executed by ${studentName} against simulated targets. The goal of this phase was to identify and demonstrate structural security exposures.`;
      
      const exploits = histories.filter(h => h.type === 'simulation');
      exploits.forEach(exp => {
        findings.push({
          title: `Exploited ${exp.details.vulnType || exp.action}`,
          severity: exp.severity,
          score: exp.details.score || 7.0,
          description: `An exploitation attempt was executed with payload: "${exp.details.payload || ''}". Success status: ${exp.details.success ? 'COMPROMISED' : 'BLOCKED'}.`
        });
      });

      const scans = histories.filter(h => h.type === 'scan');
      scans.forEach(scan => {
        findings.push({
          title: `Recon: ${scan.action}`,
          severity: scan.severity,
          score: 3.0,
          description: `Target scanning active. Details: ${scan.details.scanType || ''}`
        });
      });

      recommendations.push({
        title: 'Input Validation and Parameterization',
        description: 'Ensure all user input sockets undergo strict schema validation and query parameters are bound safely to prevent SQL injection and code scripting.'
      });
    } else if (type === 'defense') {
      summary = `This Defense Report details the security configurations and protective controls deployed by ${studentName} to mitigate active exposures and harden the application boundary.`;
      
      activeDefenses.forEach(def => {
        findings.push({
          title: `Deployed Mitigator: ${def.replace(/_/g, ' ')}`,
          severity: 'info',
          score: null,
          description: `The defensive check for ${def} has been actively configured. System monitors register correct boundary sanitizations.`
        });
      });

      recommendations.push({
        title: 'Establish Continuous Defense Auditing',
        description: 'Verify system logs and monitoring headers regularly. Ensure rate limiting rules match baseline traffic expectations.'
      });
    } else {
      summary = `This Final Security Report aggregates all Red Team exploits and Blue Team defense controls performed by ${studentName}. It provides an overview of target security posture and mitigations.`;
      
      const exploits = histories.filter(h => h.type === 'simulation');
      exploits.forEach(exp => {
        findings.push({
          title: `Red Team Exploit: ${exp.details.vulnType || exp.action}`,
          severity: exp.severity,
          score: exp.details.score || 5.0,
          description: `Exploit execution status: ${exp.details.success ? 'SUCCESS' : 'BLOCKED'}.`
        });
      });

      activeDefenses.forEach(def => {
        findings.push({
          title: `Blue Team Control: ${def.replace(/_/g, ' ')}`,
          severity: 'info',
          score: null,
          description: `Mitigation control active in application router.`
        });
      });

      recommendations.push({
        title: 'Maintain Multi-layered Defense-in-Depth',
        description: 'Ensure application filters are configured at the routing layer, controller validation layer, database query layer, and response header layer.'
      });
    }

    const report = await db.Report.create({
      userId: req.user.id,
      type,
      title: `${type.toUpperCase()} SECURITY AUDIT REPORT`,
      summary,
      studentName,
      findings,
      recommendations,
      chartData: { activeDefenses: activeDefenses.length, findingsCount: findings.length },
      pdfPath: '',
      isDeleted: false
    });

    const filename = `report_${report.id}_${Date.now()}.pdf`;
    const relativePdfPath = await pdfService.generateReportPDF(report, filename);

    const updatedReport = await db.Report.findByIdAndUpdate(report.id, { pdfPath: relativePdfPath });

    await db.History.create({
      userId: req.user.id,
      type: 'report',
      action: `Generated ${type} report: ${updatedReport.title}`,
      module: 'Reports',
      severity: 'low',
      details: { reportId: updatedReport.id, type }
    });

    return res.status(201).json({
      message: 'Report generated successfully',
      report: updatedReport
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await db.Report.find({ userId: req.user.id, isDeleted: { $ne: true } });
    return res.status(200).json({ reports });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await db.Report.findById(req.params.id);
    if (!report || report.userId !== req.user.id) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await db.Report.findByIdAndUpdate(req.params.id, { isDeleted: true });

    await db.History.create({
      userId: req.user.id,
      type: 'report',
      action: `Deleted report: ${report.title}`,
      module: 'Reports',
      severity: 'low',
      details: { reportId: report.id }
    });

    return res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const restoreReport = async (req, res) => {
  try {
    const report = await db.Report.findById(req.params.id);
    if (!report || report.userId !== req.user.id) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await db.Report.findByIdAndUpdate(req.params.id, { isDeleted: false });

    await db.History.create({
      userId: req.user.id,
      type: 'report',
      action: `Restored report: ${report.title}`,
      module: 'Reports',
      severity: 'low',
      details: { reportId: report.id }
    });

    return res.status(200).json({ message: 'Report restored successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  generateReport,
  getReports,
  deleteReport,
  restoreReport
};
