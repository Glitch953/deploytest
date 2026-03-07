const ArchiveItem = require('../models/Archive');

exports.getArchiveData = async (req, res) => {
    try {
        const items = await ArchiveItem.find().sort({ year: -1, month: -1 });
        
        const groupedItems = {};
        
        items.forEach(item => {
            const key = `${item.month}-${item.year}`;
            
            if (!groupedItems[key]) {
                groupedItems[key] = {
                    month: item.month,
                    year: item.year,
                    items: []
                };
            }
            
            groupedItems[key].items.push(item);
        });
        
        const groupedItemsArray = Object.values(groupedItems);
        
        const totalItems = items.length;
        
        const totalParticipants = items.reduce((sum, item) => {
            return sum + (parseInt(item.participants) || 0);
        }, 0);
        
        let monthsCount = '٤';
        
        if (items.length > 0) {
            const monthNames = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 
                               'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            
            const dates = items.map(e => {
                const monthIndex = monthNames.indexOf(e.month);
                return new Date(parseInt(e.year), monthIndex);
            });
            
            const oldestDate = new Date(Math.min(...dates));
            const newestDate = new Date(Math.max(...dates));
            
            const monthDiff = (newestDate.getFullYear() - oldestDate.getFullYear()) * 12 + 
                             (newestDate.getMonth() - oldestDate.getMonth()) + 1;
            
            monthsCount = monthDiff.toString();
        }
        
        const statistics = [
            {
                value: items.length > 0 ? items[0].month + ' ' + items[0].year : 'أكتوبر ٢٠٢٥',
                label: 'شهر التأسيس'
            },
            {
                value: monthsCount,
                label: 'شهور من العطاء'
            },
            {
                value: totalItems.toString(),
                label: 'فعالية سابقة'
            },
            {
                value: totalParticipants + '+',
                label: 'مستفيد'
            }
        ];
        
        res.status(200).json({
            success: true,
            data: {
                statistics,
                groupedItems: groupedItemsArray
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// جلب عنصر محدد
exports.getArchiveItemById = async (req, res) => {
    try {
        const item = await ArchiveItem.findById(req.params.id);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'العنصر غير موجود'
            });
        }
        
        res.status(200).json({
            success: true,
            data: item
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// إضافة عنصر جديد
exports.createArchiveItem = async (req, res) => {
    try {
        const { title, description, category, month, year, participants, imageUrl } = req.body;
        
        const newItem = await ArchiveItem.create({
            title,
            description,
            category,
            month,
            year,
            participants,
            imageUrl: imageUrl || '/images/default-event.jpg'
        });
        
        res.status(201).json({
            success: true,
            data: newItem
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// تحديث عنصر
exports.updateArchiveItem = async (req, res) => {
    try {
        const item = await ArchiveItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'العنصر غير موجود'
            });
        }
        
        res.status(200).json({
            success: true,
            data: item
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// حذف عنصر
exports.deleteArchiveItem = async (req, res) => {
    try {
        const item = await ArchiveItem.findByIdAndDelete(req.params.id);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'العنصر غير موجود'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'تم حذف العنصر بنجاح'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
