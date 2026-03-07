const Registration = require('../models/Registrations'); 
const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');

exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE REGISTRATION
exports.createRegistration = async (req, res) => {
  try {
    // Merge userId from authenticated user if available
    const body = { ...req.body };
    if (req.user && req.user.id) {
      body.userId = req.user.id;
      // Pre-fill name/email from user profile if not provided
      if (!body.name && req.user.username) body.name = req.user.username;
      if (!body.email && req.user.email) body.email = req.user.email;
    }
    const registration = new Registration(body);
    await registration.save();
    res.status(201).json(registration);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'registration_already_exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// GET REGISTRATION BY ID
exports.getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);
    
    if (!registration) {
      return res.status(404).json({ message: 'التسجيل غير موجود' });
    }
    
    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE REGISTRATION
exports.updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!registration) {
      return res.status(404).json({ message: 'التسجيل غير موجود' });
    }
    
    res.json(registration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE REGISTRATION
exports.deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);
    
    if (!registration) {
      return res.status(404).json({ message: 'التسجيل غير موجود' });
    }

    // Security Check: Only admin or the owner can delete
    const isOwner = req.user && (
      (registration.userId && registration.userId.toString() === req.user._id.toString()) || 
      (registration.email && registration.email === req.user.email)
    );

    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'غير مسموح لك بحذف هذا التسجيل' });
    }

    await Registration.findByIdAndDelete(id);
    
    // Log Activity
    await new ActivityLog({
      userId: req.user?._id,
      action: 'DELETE_REGISTRATION',
      details: `User deleted registration for event ID: ${registration.eventId}`,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
    }).save();

    res.json({ message: 'تم حذف التسجيل بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const registrations = await Registration.find({ eventId })
      .sort({ registeredAt: -1 });
    
    const event = await Event.findById(eventId);
    
    res.json({
      event,
      registrations,
      total: registrations.length,
      approved: registrations.filter(r => r.status === 'approved').length,
      pending: registrations.filter(r => r.status === 'pending').length,
      rejected: registrations.filter(r => r.status === 'rejected').length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET REGISTRATIONS BY USER
exports.getRegistrationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only allow users to view their own registrations (unless admin)
    if (req.user.role !== 'admin' && req.user.id !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    // Query by userId OR email as a fallback for old registrations
    const query = {
        $or: [
            { userId: userId },
            { email: req.user.email }
        ]
    };

    const registrations = await Registration.find(query)
      .populate('eventId', 'title date location status')
      .sort({ registeredAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// قبول تسجيل
exports.approveRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    
    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: 'التسجيل غير موجود' });
    }
    
    // التحقق من عدد المقاعد
    const event = await Event.findById(registration.eventId);
    if (!event) {
      return res.status(404).json({ message: 'الفعالية المرتبطة بالتسجيل غير موجودة' });
    }

    const approvedCount = await Registration.countDocuments({
      eventId: registration.eventId,
      status: 'approved'
    });
    
    if (event.seats && approvedCount >= event.seats) {
      // إذا اكتمل العدد، نرفض الباقي تلقائياً
      registration.status = 'rejected';
      registration.rejectedAt = new Date();
      registration.notes = 'اكتمل العدد المطلوب';
      await registration.save();
      
      return res.json({ 
        message: 'عذراً، اكتمل العدد المطلوب', 
        registration 
      });
    }
    
    // قبول التسجيل
    registration.status = 'approved';
    registration.approvedAt = new Date();
    await registration.save();
    
    // تحديث عداد المقاعد في الفعالية
    event.registrationsCount = approvedCount + 1;
    await event.save();

    // Log Activity
    await new ActivityLog({
      userId: req.user?._id,
      action: 'APPROVE_REGISTRATION',
      details: `Admin approved registration for: ${registration.name} on event: ${event.title}`,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
    }).save();

    res.json({ message: 'تم قبول التسجيل', registration });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// رفض تسجيل
exports.rejectRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    
    const registration = await Registration.findByIdAndUpdate(id, {
      status: 'rejected',
      rejectedAt: new Date()
    }, { new: true });
    
    if (registration) {
      // Log Activity
      await new ActivityLog({
        userId: req.user?._id,
        action: 'REJECT_REGISTRATION',
        details: `Admin rejected registration for: ${registration.name}`,
        ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
      }).save();
    }
    
    res.json({ message: 'تم رفض التسجيل', registration });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// قبول أو رفض مجموعة
exports.bulkUpdateRegistrations = async (req, res) => {
  try {
    const { ids, action } = req.body; // action: 'approve' or 'reject'
    
    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      [action === 'approve' ? 'approvedAt' : 'rejectedAt']: new Date()
    };
    
    await Registration.updateMany(
      { _id: { $in: ids } },
      updateData
    );
    
    // Log Activity
    await new ActivityLog({
      userId: req.user?._id,
      action: 'BULK_UPDATE_REGISTRATIONS',
      details: `Admin ${action === 'approve' ? 'approved' : 'rejected'} ${ids.length} registrations`,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
    }).save();

    res.json({ message: `تم ${action === 'approve' ? 'قبول' : 'رفض'} التسجيلات المحددة` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
