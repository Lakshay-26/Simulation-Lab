const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const REPORTS_DIR = path.join(UPLOADS_DIR, 'reports');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const generateReportPDF = (reportData, filename) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const relativePath = `/uploads/reports/${filename}`;
    const absolutePath = path.join(REPORTS_DIR, filename);
    const writeStream = fs.createWriteStream(absolutePath);

    doc.pipe(writeStream);

    doc.rect(0, 0, 595.28, 841.89).fill('#0F172A');

    doc.fillColor('#EF4444')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('RED TEAM vs BLUE TEAM', 50, 220, { align: 'center' });

    doc.fillColor('#3B82F6')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('SECURITY SIMULATION REPORT', 50, 260, { align: 'center' });

    doc.rect(100, 320, 395.28, 2).fill('#1E293B');

    doc.fillColor('#FFFFFF')
       .fontSize(14)
       .font('Helvetica')
       .text(`REPORT TYPE: ${reportData.type.toUpperCase()}`, 50, 370, { align: 'center' });

    doc.text(`CANDIDATE: ${reportData.studentName}`, 50, 400, { align: 'center' });
    doc.text(`DATE GENERATED: ${new Date(reportData.createdAt).toLocaleDateString()}`, 50, 430, { align: 'center' });

    doc.fontSize(10)
       .fillColor('#64748B')
       .text('CONFIDENTIAL - ETHICAL HACKING ACADEMIC SANDBOX', 50, 750, { align: 'center' });

    doc.addPage({ size: 'A4', margin: 50 });

    doc.fillColor('#0F172A')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('1. EXECUTIVE SUMMARY', 50, 50);

    doc.rect(50, 75, 495.28, 1).fill('#E2E8F0');

    doc.moveDown(1.5);
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#334155')
       .text(reportData.summary, { align: 'justify', lineGap: 5 });

    doc.moveDown(2);

    doc.fillColor('#0F172A')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('2. AUDIT FINDINGS', 50, doc.y);

    doc.rect(50, doc.y + 5, 495.28, 1).fill('#E2E8F0');
    doc.moveDown(1.5);

    if (reportData.findings.length === 0) {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#64748B')
         .text('No matching active findings recorded in simulation log history.');
    } else {
      reportData.findings.forEach((finding, idx) => {
        doc.fillColor('#1E293B')
           .fontSize(13)
           .font('Helvetica-Bold')
           .text(`${idx + 1}. ${finding.title}`, 50, doc.y);
        
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(finding.severity === 'critical' || finding.severity === 'high' ? '#EF4444' : '#F59E0B')
           .text(`Severity: ${finding.severity.toUpperCase()} | Risk Score: ${finding.score || 'N/A'}`);
        
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#334155')
           .text(finding.description, { align: 'justify', lineGap: 3 });

        doc.moveDown();
      });
    }

    doc.addPage({ size: 'A4', margin: 50 });

    doc.fillColor('#0F172A')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('3. ACTIONABLE RECOMMENDATIONS', 50, 50);

    doc.rect(50, 75, 495.28, 1).fill('#E2E8F0');
    doc.moveDown(1.5);

    if (reportData.recommendations.length === 0) {
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#64748B')
         .text('No specific mitigations recommended at this stage.');
    } else {
      reportData.recommendations.forEach((rec, idx) => {
        doc.fillColor('#1E293B')
           .fontSize(13)
           .font('Helvetica-Bold')
           .text(`${idx + 1}. Control: ${rec.title}`, 50, doc.y);
        
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#334155')
           .text(rec.description, { align: 'justify', lineGap: 3 });

        doc.moveDown();
      });
    }

    doc.moveDown(2);

    doc.fillColor('#0F172A')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('4. SYSTEM CONCLUSION', 50, doc.y);

    doc.rect(50, doc.y + 5, 495.28, 1).fill('#E2E8F0');
    doc.moveDown(1.5);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#334155')
       .text('This audit document lists activities simulated in a secure academic cyber laboratory environment. Operating custom threat models demonstrates that single-point vulnerabilities can compromise entire backend structures. Implementing comprehensive defense-in-depth principles (parameterized inputs, token authorizations, session securities, TLS, security headers) successfully addresses identified attack surfaces and hardens infrastructure boundaries.', { align: 'justify', lineGap: 5 });

    doc.end();

    writeStream.on('finish', () => resolve(relativePath));
    writeStream.on('error', (err) => reject(err));
  });
};

module.exports = {
  generateReportPDF
};
