const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  dashboardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dashboard',
    required: true
  },
  billName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Pending'
  },
  category: {
    type: String,
    required: true
  },
  vendor: {
    name: String,
    contact: String,
    email: String
  },
  description: {
    type: String,
    default: ''
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  }],
  reminders: {
    twoDaysBefore: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    paymentDay: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      count: { type: Number, default: 0 }
    }
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly']
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
billSchema.index({ dashboardId: 1, dueDate: 1 });
billSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Bill', billSchema);