const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Pruthvi', 'Nirav', 'Mitesh', 'Other', 'Apexture', 'MGC']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    currency: {
      type: String,
      default: 'INR'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      whatsapp: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

// Ensure one dashboard per name per user
dashboardSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Dashboard', dashboardSchema);