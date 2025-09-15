const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

/**
 * Send WhatsApp notification
 * @param {string} to - Recipient WhatsApp number (format: +1234567890)
 * @param {string} message - Message to send
 * @returns {Promise<Object>} - Twilio message response
 */
const sendWhatsAppNotification = async (to, message) => {
  try {
    // Ensure the number is in the correct format
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    const response = await client.messages.create({
      body: message,
      from: WHATSAPP_NUMBER,
      to: formattedTo
    });

    console.log(`WhatsApp message sent successfully: ${response.sid}`);
    return response;
  } catch (error) {
    console.error('WhatsApp notification failed:', error);
    throw error;
  }
};

/**
 * Send bill reminder notification
 * @param {string} phoneNumber - Recipient phone number
 * @param {Object} bill - Bill object
 * @param {string} reminderType - Type of reminder (twoDaysBefore, paymentDay)
 */
const sendBillReminder = async (phoneNumber, bill, reminderType) => {
  let message = '';
  
  if (reminderType === 'twoDaysBefore') {
    message = `🔔 Bill Payment Reminder\n\n` +
              `Bill: ${bill.billName}\n` +
              `Amount: ₹${bill.amount}\n` +
              `Due Date: ${new Date(bill.dueDate).toLocaleDateString('en-IN')}\n` +
              `Category: ${bill.category}\n\n` +
              `This is a reminder that your bill is due in 2 days. Please ensure payment is made on time.`;
  } else if (reminderType === 'paymentDay') {
    message = `⚠️ URGENT: Bill Payment Due Today\n\n` +
              `Bill: ${bill.billName}\n` +
              `Amount: ₹${bill.amount}\n` +
              `Due Date: TODAY (${new Date(bill.dueDate).toLocaleDateString('en-IN')})\n` +
              `Category: ${bill.category}\n\n` +
              `Please make the payment immediately to avoid any late fees or penalties.`;
  }

  return sendWhatsAppNotification(phoneNumber, message);
};

/**
 * Send statement sharing notification
 * @param {string} phoneNumber - Recipient phone number
 * @param {Object} statement - Statement object
 */
const sendStatementShared = async (phoneNumber, statement) => {
  const message = `📊 Statement Shared with You\n\n` +
                  `Dashboard: ${statement.dashboardName}\n` +
                  `Period: ${new Date(statement.startDate).toLocaleDateString('en-IN')} - ${new Date(statement.endDate).toLocaleDateString('en-IN')}\n` +
                  `Shared by: ${statement.sharedBy}\n\n` +
                  `You can view this statement using the link provided. This is a read-only view.`;

  return sendWhatsAppNotification(phoneNumber, message);
};

/**
 * Send login notification
 * @param {string} phoneNumber - User's phone number
 * @param {string} userName - User's name
 */
const sendLoginNotification = async (phoneNumber, userName) => {
  const message = `🔐 Apexture Login Alert\n\n` +
                  `Hello ${userName},\n\n` +
                  `Your Apexture account was accessed at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.\n\n` +
                  `If this wasn't you, please contact support immediately.`;

  return sendWhatsAppNotification(phoneNumber, message);
};

module.exports = {
  sendWhatsAppNotification,
  sendBillReminder,
  sendStatementShared,
  sendLoginNotification
};