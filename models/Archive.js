const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان الفعالية مطلوب'], 
    trim: true
  },

  description: {
    type: String,
    trim: true,
    required: [true, 'وصف الفعالية مطلوب'] 
  },

  category: {
    type: String,
    required: [true, 'التصنيف مطلوب'],
    enum: ['رياضة', 'تكنولوجيا', 'ريادة أعمال', 'تطوع', 'إنجاز', 'حفل تأسيس', 'تعليم', 'ثقافة'],
    default: 'فعالية'
  },

  month: {
    type: String,
    trim: true,
    required: [true, 'الشهر مطلوب']
  },

  year: {
    type: String,
    trim: true,
    required: [true, 'السنة مطلوبة']
  },

  participants: {
    type: Number,
    required: [true, 'عدد المشاركين مطلوب'],
    min: 0
  },
  
  imageUrl: {
    type: String,
    required: [true, 'صورة الفعالية مطلوبة'],
  },

  isFoundingEvent: { 
    type: Boolean,
    default: false
  },

  createdAt: { 
    type: Date,
    default: Date.now
  }
});

archiveSchema.index({ month: 1, year: -1 });
archiveSchema.index({ category: 1 });
archiveSchema.index({ createdAt: -1 });

archiveSchema.virtual('formattedDate').get(function() {
  return `${this.month} ${this.year}`;
});

const Archive = mongoose.model('Archive', archiveSchema);
module.exports = Archive;
