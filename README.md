# EYF Website

موقع مؤسسة EYF - Node.js + Express + MongoDB Atlas

## تشغيل المشروع محلياً

```bash
npm install
node server.js
```

## رفع على Render.com

1. ارفع المشروع على GitHub
2. افتح [render.com](https://render.com) وأنشئ **Web Service** جديد
3. اربطه بـ GitHub repository
4. الإعدادات:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. أضف **Environment Variables**:
   - `MONGODB_URI` = رابط قاعدة البيانات
   - `JWT_SECRET` = المفتاح السري
6. اضغط **Deploy**

> **ملاحظة:** على الخطة المجانية، الصور المرفوعة (`uploads/`) لن تبقى بعد إعادة تشغيل السيرفر.