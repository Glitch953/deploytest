const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  instructor: {
    type: String,
    required: true,
    trim: true
  },
  
  type: {
    type: String,
    required: true,
    enum: ['courses', 'events', 'workshops', 'upcoming'],
    default: 'courses'
  },
  
  duration: {
    type: String,
    required: true,
    trim: true
  },
  
  date: {
    type: String,
    trim: true,
    default: null
  },
  
  seats: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  icon: {
    type: String,
    default: 'fa-code',
    trim: true
  },
  
  status: {
    type: Boolean,
    default: true
  },
  
  description: {
    type: String,
    trim: true,
    default: ''
  },
  
  bgColor: {
    type: String,
    default: 'from-accent to-[#0b446b]'
  },
  registrationsCount: {
    type: Number,
    default: 0
  }
});

const Event = mongoose.model('Event', eventSchema, 'event');
module.exports = Event;
