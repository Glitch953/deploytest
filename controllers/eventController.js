const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET EVENTS BY ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // التحقق من صحة طول الـ ID
    if (id.length !== 24) {
      return res.status(400).json({ 
        message: 'معرف الفعالية غير صالح - يجب أن يكون 24 حرفاً' 
      });
    }

    const event = await Event.findOne({ _id: id });

    if (!event) {
      return res.status(404).json({ message: 'الفعالية غير موجودة' });
    }

    res.json(event);
  } catch (error) { 
    // إذا كان الخطأ بسبب صيغة ObjectId غير صحيحة
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'معرف الفعالية غير صالح' });
    }
    res.status(500).json({ message: error.message });
  }
};

// CREATE EVENTS
exports.createEvent = async (req, res) => {
  try {
    console.log('--- CREATE EVENT ATTEMPT ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user?._id);

    const event = new Event(req.body);
    await event.save();
    console.log('Event saved successfully:', event._id);

    // Log Activity
    try {
      await new ActivityLog({
        userId: req.user?._id,
        action: 'CREATE_EVENT',
        details: `Admin created event: ${event.title}`,
        ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
      }).save();
      console.log('Activity log saved');
    } catch (logError) {
      console.error('Failed to save activity log:', logError);
      // Don't fail the response if just logging fails
    }

    res.status(201).json(event);
  } catch (error) {
    console.error('❌ CREATE EVENT ERROR:', error);
    res.status(400).json({ message: error.message });
  }
};

// UPDATE EVENTS
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true
    });

    if (!event) {
      return res.status(404).json({ message: 'الفعالية غير موجودة' });
    }

    // Log Activity
    await new ActivityLog({
      userId: req.user?._id,
      action: 'UPDATE_EVENT',
      details: `Admin updated event: ${event.title}`,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
    }).save();

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE EVENTS
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOneAndDelete({ _id: id });

    if (!event) {
      return res.status(404).json({ message: 'الفعالية غير موجودة' });
    }

    // Log Activity
    await new ActivityLog({
      userId: req.user?._id,
      action: 'DELETE_EVENT',
      details: `Admin deleted event: ${event.title}`,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
    }).save();

    res.json({ message: 'تم حذف الفعالية بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // true أو false
    
    const event = await Event.findByIdAndUpdate(id, 
      { status: status }, 
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'الفعالية غير موجودة' });
    }
    
    res.json({ 
      message: status ? 'تم نشر الفعالية' : 'تم حفظ الفعالية كمسودة',
      event 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// تفعيل/تعطيل الفعالية (isActive)
exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const event = await Event.findByIdAndUpdate(id, 
      { isActive }, 
      { new: true }
    );
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
