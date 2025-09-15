const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  dashboardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dashboard',
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    required: true,
    enum: ['Bank', 'Cash', 'Credit Card', 'Investment', 'Loan', 'Other']
  },
  accountNumber: {
    type: String,
    default: ''
  },
  bankName: {
    type: String,
    default: ''
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Account', accountSchema);