const path = require('path');
const fs = require('fs');

async function runVerification() {
  console.log('[*] Commencing automated project validation...');

  try {
    const db = require('./backend/config/db');
    console.log('[+] Database module imports successfully.');

    await db.connectDB();
    console.log(`[+] Database initialized. MongoDB connection: ${db.isUsingMongo()}`);

    const mockUser = {
      username: 'test_cadet_' + Math.random().toString(36).substring(2, 6),
      email: 'test_' + Math.random().toString(36).substring(2, 6) + '@verify.local',
      password: 'verification_password',
      role: 'student',
      activeDefenses: ['parameterized_queries']
    };

    const user = await db.User.create(mockUser);
    console.log(`[+] User database entry validated successfully. ID: ${user.id || user._id}`);

    const log = await db.History.create({
      userId: user.id || user._id,
      type: 'simulation',
      action: 'Verified SQLi protection',
      module: 'Red Team',
      severity: 'low',
      details: { vulnType: 'SQLi', success: false }
    });
    console.log(`[+] History audit database entry validated. ID: ${log.id || log._id}`);

    const reportData = {
      type: 'attack',
      studentName: 'Verification System',
      createdAt: new Date().toISOString(),
      summary: 'Automated sanity check of PDF rendering.',
      findings: [
        { title: 'Injection Test', severity: 'critical', score: 9.8, description: 'Simulated breach validation.' }
      ],
      recommendations: [
        { title: 'Bind Parameters', description: 'Prepared bindings constraint verification.' }
      ]
    };

    const pdfService = require('./backend/services/pdfService');
    const filename = `verify_report_${Date.now()}.pdf`;
    const relativePath = await pdfService.generateReportPDF(reportData, filename);
    const absolutePath = path.join(__dirname, 'backend', relativePath);

    if (fs.existsSync(absolutePath)) {
      console.log(`[+] PDF Generator service validated. File created at: ${absolutePath}`);
      fs.unlinkSync(absolutePath);
    } else {
      throw new Error('PDF output file not generated on disk.');
    }

    await db.History.deleteMany({ userId: user.id || user._id });
    await db.User.findByIdAndDelete(user.id || user._id);
    console.log('[+] Temporary verification records purged.');

    console.log('\n[=== VERIFICATION SUCCESSFUL ===]');
  } catch (error) {
    console.error('\n[!] VERIFICATION FAILURE:', error.message);
    process.exit(1);
  }
}

runVerification();
