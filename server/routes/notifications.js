const express = require('express');
const cron = require('node-cron');
const Bill = require('../models/Bill');
const User = require('../models/User');
const Dashboard = require('../models/Dashboard');
const { sendBillReminder, sendWhatsAppNotification } = require('../services/whatsappService');
const router = express.Router();

// Schedule bill reminders
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily bill reminder check...');
  await checkBillReminders();
});

// Function to check and send bill reminders
async function checkBillReminders() {
  try {
    const today = new Date();
    const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    // Find bills due in 2 days
    const billsDueInTwoDays = await Bill.find({
      status: 'Pending',
      dueDate: {
        $gte: new Date(twoDaysFromNow.getFullYear(), twoDaysFromNow.getMonth(), twoDaysFromNow.getDate()),
        $lt: new Date(twoDaysFromNow.getFullYear(), twoDaysFromNow.getMonth(), twoDaysFromNow.getDate() + 1)
      },
      'reminders.twoDaysBefore.sent': false
    }).populate('dashboardId', 'name userId');

    // Send 2-day reminders
    for (const bill of billsDueInTwoDays) {
      try {
        const user = await User.findById(bill.dashboardId.userId);
        if (user && user.whatsappNumber) {
          await sendBillReminder(user.whatsappNumber, bill, 'twoDaysBefore');
          
          // Mark reminder as sent
          bill.reminders.twoDaysBefore.sent = true;
          bill.reminders.twoDaysBefore.sentAt = new Date();
          await bill.save();
        }
      } catch (error) {
        console.error(`Error sending 2-day reminder for bill ${bill._id}:`, error);
      }
    }

    // Find bills due today
    const billsDueToday = await Bill.find({
      status: 'Pending',
      dueDate: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    }).populate('dashboardId', 'name userId');

    // Send payment day reminders (3 times throughout the day)
    const currentHour = today.getHours();
    const reminderHours = [9, 14, 18]; // 9 AM, 2 PM, 6 PM
    
    if (reminderHours.includes(currentHour)) {
      for (const bill of billsDueToday) {
        try {
          const user = await User.findById(bill.dashboardId.userId);
          if (user && user.whatsappNumber) {
            // Check if we haven't sent 3 reminders today
            if (bill.reminders.paymentDay.count < 3) {
              await sendBillReminder(user.whatsappNumber, bill, 'paymentDay');
              
              // Update reminder count
              bill.reminders.paymentDay.count += 1;
              bill.reminders.paymentDay.sentAt = new Date();
              await bill.save();
            }
          }
        } catch (error) {
          console.error(`Error sending payment day reminder for bill ${bill._id}:`, error);
        }
      }
    }

    // Mark overdue bills
    await Bill.updateMany(
      {
        status: 'Pending',
        dueDate: { $lt: today }
      },
      { status: 'Overdue' }
    );

  } catch (error) {
    console.error('Error in bill reminder check:', error);
  }
}

// Manual trigger for bill reminders (for testing)
router.post('/trigger-bill-reminders', async (req, res) => {
  try {
    await checkBillReminders();
    res.json({ message: 'Bill reminders triggered successfully' });
  } catch (error) {
    console.error('Error triggering bill reminders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send test WhatsApp notification
router.post('/test-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ message: 'Phone number and message are required' });
    }

    await sendWhatsAppNotification(phoneNumber, message);
    res.json({ message: 'Test notification sent successfully' });

  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get notification settings for a user
router.get('/settings', async (req, res) => {
  try {
    // This would typically require authentication
    // For now, return default settings
    res.json({
      whatsapp: {
        enabled: true,
        billReminders: true,
        loginAlerts: true,
        statementAlerts: true
      },
      email: {
        enabled: false,
        billReminders: false,
        loginAlerts: false,
        statementAlerts: false
      }
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update notification settings
router.put('/settings', async (req, res) => {
  try {
    // This would typically require authentication and update user settings
    res.json({ message: 'Notification settings updated successfully' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;