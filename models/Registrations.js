const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'], 
    trim: true
  },

  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    trim: true,
    lowercase: true, 
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صحيح'] 
  },
  
  eventId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', 
    required: [true, 'معرف الفعالية مطلوب']
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest registrations if supported, but good for logged in users
  },
  
  eventName: {
    type: String,
    trim: true,
  },
  
  registeredAt: {
    type: Date,
    default: Date.now 
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'waitlist'], 
    default: 'pending'
  },
  
  notes: { 
    type: String, 
    default: '' 
  },
  
  approvedAt: { 
    type: Date 
  },
  
  rejectedAt: { 
    type: Date 
  }

}, {
  timestamps: true 
});

registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });
const Registration = mongoose.model('Registration', registrationSchema, 'registrations');
module.exports = Registration;