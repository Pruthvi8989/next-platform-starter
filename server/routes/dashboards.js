const express = require('express');
const { body, validationResult } = require('express-validator');
const Dashboard = require('../models/Dashboard');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all dashboards for a user
router.get('/', auth, async (req, res) => {
  try {
    const dashboards = await Dashboard.find({ userId: req.user.id });
    res.json(dashboards);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific dashboard with summary
router.get('/:id', auth, async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    // Get accounts for this dashboard
    const accounts = await Account.find({ 
      dashboardId: dashboard._id, 
      isActive: true 
    });

    // Get recent transactions
    const recentTransactions = await Transaction.find({ 
      dashboardId: dashboard._id 
    })
    .sort({ date: -1 })
    .limit(10)
    .populate('accountId', 'accountName accountType');

    // Get pending bills
    const pendingBills = await Bill.find({ 
      dashboardId: dashboard._id, 
      status: 'Pending' 
    }).sort({ dueDate: 1 });

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    // Calculate monthly income and expenses
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyTransactions = await Transaction.find({
      dashboardId: dashboard._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      dashboard,
      summary: {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        accountCount: accounts.length,
        pendingBillsCount: pendingBills.length
      },
      accounts,
      recentTransactions,
      pendingBills
    });

  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new dashboard
router.post('/', [
  auth,
  body('name').isIn(['Pruthvi', 'Nirav', 'Mitesh', 'Other', 'Apexture', 'MGC']).withMessage('Invalid dashboard name'),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description } = req.body;

    // Check if dashboard already exists for this user
    const existingDashboard = await Dashboard.findOne({ 
      name, 
      userId: req.user.id 
    });

    if (existingDashboard) {
      return res.status(400).json({ 
        message: 'Dashboard with this name already exists' 
      });
    }

    const dashboard = new Dashboard({
      name,
      description: description || '',
      userId: req.user.id
    });

    await dashboard.save();

    res.status(201).json(dashboard);

  } catch (error) {
    console.error('Error creating dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update dashboard
router.put('/:id', [
  auth,
  body('description').optional().isString(),
  body('settings').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const dashboard = await Dashboard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    res.json(dashboard);

  } catch (error) {
    console.error('Error updating dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete dashboard
router.delete('/:id', auth, async (req, res) => {
  try {
    const dashboard = await Dashboard.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    // Also delete associated accounts, transactions, and bills
    await Promise.all([
      Account.deleteMany({ dashboardId: dashboard._id }),
      Transaction.deleteMany({ dashboardId: dashboard._id }),
      Bill.deleteMany({ dashboardId: dashboard._id })
    ]);

    res.json({ message: 'Dashboard deleted successfully' });

  } catch (error) {
    console.error('Error deleting dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get dashboard analytics
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    const { period = 'month' } = req.query;
    let startDate, endDate;

    const now = new Date();
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get transactions for the period
    const transactions = await Transaction.find({
      dashboardId: dashboard._id,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate analytics
    const income = transactions.filter(t => t.type === 'Income');
    const expenses = transactions.filter(t => t.type === 'Expense');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    // Category-wise breakdown
    const incomeByCategory = {};
    const expensesByCategory = {};

    income.forEach(t => {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    });

    expenses.forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

    // Monthly trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthTransactions = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );
      
      const monthIncome = monthTransactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthExpenses = monthTransactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses
      });
    }

    res.json({
      period,
      summary: {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        transactionCount: transactions.length
      },
      incomeByCategory,
      expensesByCategory,
      monthlyTrend
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;