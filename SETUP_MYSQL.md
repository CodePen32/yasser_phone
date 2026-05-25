# إعداد MySQL لمشروع Yasser Phone

## الخطوات بالترتيب

### 1. تأكد أن MySQL يعمل على جهازك
افتح MySQL Workbench أو phpMyAdmin أو أي عميل MySQL لديك.

### 2. أنشئ قاعدة البيانات
```sql
CREATE DATABASE yasser_phone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. عدّل ملف .env.local
افتح: `yasser-phone-next/.env.local`

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/yasser_phone"
```

استبدل `YOUR_PASSWORD` بكلمة مرور MySQL لديك.
إذا لم تكن هناك كلمة مرور: `mysql://root:@localhost:3306/yasser_phone`

### 4. شغّل Migration (ينشئ الجداول)
```bash
cd yasser-phone-next
npm run db:migrate
# اكتب اسماً للـ migration مثل: init
```

### 5. شغّل Seed (يملأ البيانات)
```bash
npm run db:seed
```

ستظهر:
```
🌱 Seeding Yasser Phone database...
  ✓ Store settings
  ✓ 8 categories
  ✓ 8 brands
  ✓ Products: 30 created, 0 skipped
  ✓ Admin user
✅ Seeding complete!
```

### 6. تحقق من البيانات (اختياري)
```bash
npm run db:studio
# يفتح Prisma Studio على http://localhost:5555
```

### 7. شغّل المشروع
```bash
npm run dev
# افتح http://localhost:3000
```

## بيانات الدخول للـ Admin (بعد إعداد لوحة التحكم لاحقاً)
- Email: admin@yasserphone.mr
- Password: admin123

## هيكل الجداول
- store_settings  → إعدادات المتجر
- categories      → 8 أقسام
- brands          → 8 علامات تجارية
- products        → 30 منتج
- product_images  → صور المنتجات
- product_specs   → مواصفات المنتجات
- admins          → مديرو الموقع
- whatsapp_orders → الطلبات (اختياري لاحقاً)
