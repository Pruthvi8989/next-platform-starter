const express = require('express');
const { body, validationResult } = require('express-validator');
const Dashboard = require('../models/Dashboard');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const router = express.Router();

// Generate and download statement
router.post('/generate', [
  auth,
  body('dashboardId').isMongoId().withMessage('Valid dashboard ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('format').isIn(['pdf', 'excel']).withMessage('Format must be pdf or excel'),
  body('accountIds').optional().isArray().withMessage('Account IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify dashboard belongs to user
    const dashboard = await Dashboard.findOne({ 
      _id: req.body.dashboardId, 
      userId: req.user.id 
    });

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    const { startDate, endDate, format, accountIds } = req.body;

    // Build query for transactions
    let query = {
      dashboardId: req.body.dashboardId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    if (accountIds && accountIds.length > 0) {
      query.accountId = { $in: accountIds };
    }

    const transactions = await Transaction.find(query)
      .populate('accountId', 'accountName accountType')
      .sort({ date: -1 });

    // Get accounts for summary
    const accounts = await Account.find({ 
      dashboardId: req.body.dashboardId,
      isActive: true 
    });

    if (format === 'pdf') {
      await generatePDFStatement(res, dashboard, transactions, accounts, startDate, endDate);
    } else if (format === 'excel') {
      await generateExcelStatement(res, dashboard, transactions, accounts, startDate, endDate);
    }

  } catch (error) {
    console.error('Error generating statement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate PDF statement
async function generatePDFStatement(res, dashboard, transactions, accounts, startDate, endDate) {
  const doc = new PDFDocument();
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="statement_${dashboard.name}_${startDate}_${endDate}.pdf"`);
  
  doc.pipe(res);

  // Header
  doc.fontSize(20).text('Apexture Statement', 50, 50);
  doc.fontSize(14).text(`Dashboard: ${dashboard.name}`, 50, 80);
  doc.text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 50, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 50, 120);

  // Summary
  doc.fontSize(16).text('Account Summary', 50, 160);
  let yPosition = 190;
  
  accounts.forEach(account => {
    doc.fontSize(12).text(`${account.accountName} (${account.accountType}): ₹${account.balance}`, 70, yPosition);
    yPosition += 20;
  });

  // Transactions
  doc.fontSize(16).text('Transactions', 50, yPosition + 20);
  yPosition += 50;

  transactions.forEach(transaction => {
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(10)
      .text(transaction.date.toLocaleDateString(), 70, yPosition)
      .text(transaction.description, 150, yPosition)
      .text(transaction.type, 350, yPosition)
      .text(transaction.category, 420, yPosition)
      .text(`₹${transaction.amount}`, 500, yPosition);
    
    yPosition += 15;
  });

  doc.end();
}

// Generate Excel statement
async function generateExcelStatement(res, dashboard, transactions, accounts, startDate, endDate) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Statement');

  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="statement_${dashboard.name}_${startDate}_${endDate}.xlsx"`);

  // Header
  worksheet.mergeCells('A1:F1');
  worksheet.getCell('A1').value = 'Apexture Statement';
  worksheet.getCell('A1').font = { size: 16, bold: true };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  worksheet.getCell('A2').value = `Dashboard: ${dashboard.name}`;
  worksheet.getCell('A3').value = `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
  worksheet.getCell('A4').value = `Generated: ${new Date().toLocaleString()}`;

  // Account Summary
  worksheet.getCell('A6').value = 'Account Summary';
  worksheet.getCell('A6').font = { bold: true };
  
  let row = 7;
  accounts.forEach(account => {
    worksheet.getCell(`A${row}`).value = account.accountName;
    worksheet.getCell(`B${row}`).value = account.accountType;
    worksheet.getCell(`C${row}`).value = account.balance;
    row++;
  });

  // Transactions
  row += 2;
  worksheet.getCell(`A${row}`).value = 'Transactions';
  worksheet.getCell(`A${row}`).font = { bold: true };
  
  row++;
  worksheet.getCell(`A${row}`).value = 'Date';
  worksheet.getCell(`B${row}`).value = 'Description';
  worksheet.getCell(`C${row}`).value = 'Type';
  worksheet.getCell(`D${row}`).value = 'Category';
  worksheet.getCell(`E${row}`).value = 'Amount';
  worksheet.getCell(`F${row}`).value = 'Account';
  
  // Style header row
  for (let col = 1; col <= 6; col++) {
    worksheet.getCell(row, col).font = { bold: true };
    worksheet.getCell(row, col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE3B448' }
    };
  }

  row++;
  transactions.forEach(transaction => {
    worksheet.getCell(`A${row}`).value = transaction.date;
    worksheet.getCell(`B${row}`).value = transaction.description;
    worksheet.getCell(`C${row}`).value = transaction.type;
    worksheet.getCell(`D${row}`).value = transaction.category;
    worksheet.getCell(`E${row}`).value = transaction.amount;
    worksheet.getCell(`F${row}`).value = transaction.accountId.accountName;
    row++;
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  await workbook.xlsx.write(res);
  res.end();
}

// Schedule statement sending
router.post('/schedule', [
  auth,
  body('dashboardId').isMongoId().withMessage('Valid dashboard ID is required'),
  body('frequency').isIn(['daily', 'weekly', 'monthly']).withMessage('Frequency must be daily, weekly, or monthly'),
  body('recipients').isArray().withMessage('Recipients must be an array'),
  body('format').isIn(['pdf', 'excel']).withMessage('Format must be pdf or excel')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify dashboard belongs to user
    const dashboard = await Dashboard.findOne({ 
      _id: req.body.dashboardId, 
      userId: req.user.id 
    });

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    // TODO: Implement statement scheduling logic
    // This would involve creating a scheduled job using node-cron
    // and storing the schedule configuration in the database

    res.json({ message: 'Statement schedule created successfully' });

  } catch (error) {
    console.error('Error scheduling statement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Share statement (read-only)
router.post('/share', [
  auth,
  body('dashboardId').isMongoId().withMessage('Valid dashboard ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('recipients').isArray().withMessage('Recipients must be an array'),
  body('message').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify dashboard belongs to user
    const dashboard = await Dashboard.findOne({ 
      _id: req.body.dashboardId, 
      userId: req.user.id 
    });

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    // TODO: Implement statement sharing logic
    // This would involve:
    // 1. Creating a shareable link with read-only access
    // 2. Sending the link to recipients via WhatsApp/email
    // 3. Storing the shared statement configuration

    res.json({ message: 'Statement shared successfully' });

  } catch (error) {
    console.error('Error sharing statement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;