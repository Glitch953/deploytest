const News = require('../models/News');
const ActivityLog = require('../models/ActivityLog');

// GET ALL NEWS
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET NEWS BY ID
exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من صحة طول الـ ID
    if (id.length !== 24) {
      return res.status(400).json({
        message: 'معرف الخبر غير صالح - يجب أن يكون 24 حرفاً'
      });
    }

    const news = await News.findOne({ _id: id });

    if (!news) {
      return res.status(404).json({ message: 'الخبر غير موجود' });
    }

    res.json(news);
  } catch (error) {
    // إذا كان الخطأ بسبب صيغة ObjectId غير صحيحة
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'معرف الخبر غير صالح' });
    }
    res.status(500).json({ message: error.message });
  }
};

// CREATE NEWS
exports.createNews = async (req, res) => {
  try {
    console.log('--- CREATE NEWS ATTEMPT ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const news = new News(req.body);
    await news.save();
    console.log('News saved successfully:', news._id);

    // Log Activity
    try {
      await new ActivityLog({
        userId: req.user?._id,
        action: 'CREATE_NEWS',
        details: `Admin created news: ${news.title}`,
        ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
      }).save();
      console.log('Activity log saved');
    } catch (logError) {
      console.error('Failed to save activity log:', logError);
    }

    res.status(201).json(news);
  } catch (error) {
    console.error('❌ CREATE NEWS ERROR:', error);
    res.status(400).json({ message: error.message });
  }
};

// UPDATE NEWS
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true
    });

    if (!news) {
      return res.status(404).json({ message: 'الخبر غير موجود' });
    }

    // Log Activity
    await new ActivityLog({
      userId: req.user?._id,
      action: 'UPDATE_NEWS',
      details: `Admin updated news: ${news.title}`,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
    }).save();

    res.json(news);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE NEWS
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findOneAndDelete({ _id: id });

    if (!news) {
      return res.status(404).json({ message: 'الخبر غير موجود' });
    }

    // Log Activity
    await new ActivityLog({
      userId: req.user?._id,
      action: 'DELETE_NEWS',
      details: `Admin deleted news: ${news.title}`,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
    }).save();

    res.json({ message: 'تم حذف الخبر بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    
    const { id } = req.params;
    const { text } = req.body;

    // req.user comes from authMiddleware
    const user = req.user;

    if (!text) {
      return res.status(400).json({ message: 'نص التعليق مطلوب' });
    }

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: 'الخبر غير موجود' });
    }

    const newComment = {
      userId: user._id,
      username: user.username,
      userType: user.userType,
      profilePhoto: user.profilePhoto,
      text: text,
      createdAt: new Date()
    };

    news.comments.push(newComment);
    await news.save();

    // Log Activity
    await new ActivityLog({
      userId: user._id,
      action: 'ADD_COMMENT',
      details: `User added comment on: ${news.title}`,
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
    }).save();

    res.status(201).json(news.comments);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error while adding comment' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const user = req.user;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: 'الخبر غير موجود' });
    }

    const comment = news.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'التعليق غير موجود' });
    }

    // Check if user is owner or admin
    if (comment.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذا التعليق' });
    }

    news.comments.pull(commentId);
    await news.save();

    res.json({ message: 'تم حذف التعليق بنجاح', comments: news.comments });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Internal server error while deleting comment' });
  }
};
