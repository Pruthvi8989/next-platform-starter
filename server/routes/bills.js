const express = require('express');
const { body, validationResult } = require('express-validator');
const Bill = require('../models/Bill');
const Dashboard = require('../models/Dashboard');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendBillReminder } = require('../services/whatsappService');
const router = express.Router();

// Get all bills for a dashboard
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

    const { status, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;
    
    let query = { dashboardId: req.params.dashboardId };
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const bills = await Bill.find(query).sort(sortOptions);
    res.json(bills);

  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific bill
router.get('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('dashboardId', 'name');
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Verify dashboard belongs to user
    const dashboard = await Dashboard.findOne({ 
      _id: bill.dashboardId._id, 
      userId: req.user.id 
    });

    if (!dashboard) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(bill);

  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new bill
router.post('/', [
  auth,
  body('dashboardId').isMongoId().withMessage('Valid dashboard ID is required'),
  body('billName').notEmpty().withMessage('Bill name is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('category').notEmpty().withMessage('Category is required')
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

    const bill = new Bill({
      ...req.body,
      dashboardId: req.body.dashboardId
    });

    await bill.save();
    res.status(201).json(bill);

  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update bill
router.put('/:id', [
  auth,
  body('billName').optional().notEmpty(),
  body('amount').optional().isNumeric(),
  body('dueDate').optional().isISO8601(),
  body('category').optional().notEmpty(),
  body('status').optional().isIn(['Pending', 'Paid', 'Overdue', 'Cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bill = await Bill.findById(req.params.id).populate('dashboardId', 'name userId');
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Verify dashboard belongs to user
    if (bill.dashboardId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedBill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedBill);

  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark bill as paid
router.patch('/:id/paid', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('dashboardId', 'name userId');
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Verify dashboard belongs to user
    if (bill.dashboardId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    bill.status = 'Paid';
    bill.paymentDate = new Date();
    
    await bill.save();
    res.json(bill);

  } catch (error) {
    console.error('Error marking bill as paid:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete bill
router.delete('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('dashboardId', 'name userId');
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Verify dashboard belongs to user
    if (bill.dashboardId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bill deleted successfully' });

  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get overdue bills
router.get('/dashboard/:dashboardId/overdue', auth, async (req, res) => {
  try {
    // Verify dashboard belongs to user
    const dashboard = await Dashboard.findOne({ 
      _id: req.params.dashboardId, 
      userId: req.user.id 
    });

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    const overdueBills = await Bill.find({
      dashboardId: req.params.dashboardId,
      status: 'Pending',
      dueDate: { $lt: new Date() }
    }).sort({ dueDate: 1 });

    res.json(overdueBills);

  } catch (error) {
    console.error('Error fetching overdue bills:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get upcoming bills (due in next 7 days)
router.get('/dashboard/:dashboardId/upcoming', auth, async (req, res) => {
  try {
    // Verify dashboard belongs to user
    const dashboard = await Dashboard.findOne({ 
      _id: req.params.dashboardId, 
      userId: req.user.id 
    });

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingBills = await Bill.find({
      dashboardId: req.params.dashboardId,
      status: 'Pending',
      dueDate: { $gte: today, $lte: nextWeek }
    }).sort({ dueDate: 1 });

    res.json(upcomingBills);

  } catch (error) {
    console.error('Error fetching upcoming bills:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send manual reminder for a bill
router.post('/:id/remind', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('dashboardId', 'name userId');
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Verify dashboard belongs to user
    if (bill.dashboardId.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user's WhatsApp number
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine reminder type based on due date
    const today = new Date();
    const dueDate = new Date(bill.dueDate);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    let reminderType = 'paymentDay';
    if (daysUntilDue > 0) {
      reminderType = 'twoDaysBefore';
    }

    // Send WhatsApp reminder
    await sendBillReminder(user.whatsappNumber, bill, reminderType);

    res.json({ message: 'Reminder sent successfully' });

  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;