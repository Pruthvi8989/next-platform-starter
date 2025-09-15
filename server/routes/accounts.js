const express = require('express');
const { body, validationResult } = require('express-validator');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Dashboard = require('../models/Dashboard');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all accounts for a dashboard
router.get('/dashboard/:dashboardId', auth, async (req, res) => {
  try {
    // Verify dashboard belongs to user
    const dashboard = await Dashboard.findOne({ 
      _id: req.params.dashboardId, 
      userId: req.user.id 
    });

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    const accounts = await Account.find({ 
      dashboardId: req.params.dashboardId,
      isActive: true 
    }).sort({ accountName: 1 });

    res.json(accounts);

  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific account with transactions
router.get('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).populate('dashboardId', 'name userId');
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Verify dashboard belongs to user
    if (account.dashboardId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get recent transactions
    const transactions = await Transaction.find({ 
      accountId: req.params.id 
    })
    .sort({ date: -1 })
    .limit(50);

    res.json({
      account,
      transactions
    });

  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new account
router.post('/', [
  auth,
  body('dashboardId').isMongoId().withMessage('Valid dashboard ID is required'),
  body('accountName').notEmpty().withMessage('Account name is required'),
  body('accountType').isIn(['Bank', 'Cash', 'Credit Card', 'Investment', 'Loan', 'Other']).withMessage('Invalid account type'),
  body('balance').optional().isNumeric().withMessage('Balance must be a number')
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

    const account = new Account({
      ...req.body,
      dashboardId: req.body.dashboardId,
      balance: req.body.balance || 0
    });

    await account.save();
    res.status(201).json(account);

  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update account
router.put('/:id', [
  auth,
  body('accountName').optional().notEmpty(),
  body('accountType').optional().isIn(['Bank', 'Cash', 'Credit Card', 'Investment', 'Loan', 'Other']),
  body('balance').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const account = await Account.findById(req.params.id).populate('dashboardId', 'name userId');
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Verify dashboard belongs to user
    if (account.dashboardId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAccount = await Account.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedAccount);

  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete account
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).populate('dashboardId', 'name userId');
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Verify dashboard belongs to user
    if (account.dashboardId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if account has transactions
    const transactionCount = await Transaction.countDocuments({ accountId: req.params.id });
    
    if (transactionCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete account with existing transactions. Please delete transactions first or deactivate the account.' 
      });
    }

    await Account.findByIdAndDelete(req.params.id);
    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Deactivate account
router.patch('/:id/deactivate', auth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).populate('dashboardId', 'name userId');
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Verify dashboard belongs to user
    if (account.dashboardId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    account.isActive = false;
    await account.save();

    res.json(account);

  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;