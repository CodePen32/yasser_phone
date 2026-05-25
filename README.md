# Yasser Phone — متجر الهواتف الذكية

منصة تجارة إلكترونية متكاملة لبيع الهواتف والإكسسوارات، مبنية بـ Next.js 15 + TypeScript + Prisma + MySQL.

---

## المتطلبات

| أداة | الإصدار المطلوب |
|------|-----------------|
| Node.js | 18.17 أو أحدث |
| npm | 9+ |
| MySQL | 8.0+ |

---

## تثبيت المشروع

```bash
# 1. استنساخ المستودع
git clone <repo-url>
cd yasser-phone-next

# 2. تثبيت الحزم
npm install
```

---

## إعداد قاعدة البيانات (MySQL)

```sql
-- أنشئ قاعدة بيانات جديدة
CREATE DATABASE yasser_phone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- أنشئ مستخدماً مخصصاً (لا تستخدم root في production)
CREATE USER 'yasser_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON yasser_phone.* TO 'yasser_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## إعداد متغيرات البيئة

```bash
# انسخ الملف المثال
cp .env.example .env.local
```

افتح `.env.local` وعدّل القيم:

```env
DATABASE_URL="mysql://yasser_user:strong_password_here@localhost:3306/yasser_phone"
JWT_SECRET="generate-with-openssl-rand-base64-32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **مهم:** `.env.local` لا يُرفع أبداً إلى git. تأكد أنه في `.gitignore`.

لتوليد JWT_SECRET قوي:
```bash
openssl rand -base64 32
```

---

## أوامر Prisma

```bash
# تطبيق الـ migrations على قاعدة البيانات
npx prisma migrate dev

# إنشئ Prisma Client بعد أي تغيير في schema
npx prisma generate

# فتح Prisma Studio لاستعراض البيانات
npx prisma studio
```

---

## تعبئة البيانات الأولية (Seed)

```bash
npm run db:seed
```

يُنشئ الـ seed:
- أقساماً ومنتجات وماركات تجريبية
- حساب admin افتراضي

> **تحذير:** غيّر كلمة مرور الـ admin فور تشغيل المشروع في production.

---

## تشغيل بيئة التطوير

```bash
npm run dev
```

يعمل على: `http://localhost:3000`

---

## بناء النسخة النهائية

```bash
npm run build
npm start
```

---

## بيانات دخول لوحة التحكم (الافتراضية)

| الحقل | القيمة |
|-------|--------|
| البريد | `admin@yasserphone.mr` |
| كلمة المرور | `admin123` |

> **غيّر كلمة المرور فوراً بعد أول تسجيل دخول في production.**

---

## لوحة التحكم — الصفحات

| المسار | الوظيفة |
|--------|---------|
| `/admin` | لوحة الإحصاءات الرئيسية |
| `/admin/products` | إدارة المنتجات (إضافة، تعديل، حذف، تفعيل) |
| `/admin/products/new` | إضافة منتج جديد مع صور ومواصفات |
| `/admin/categories` | إدارة الأقسام |
| `/admin/brands` | إدارة الماركات |
| `/admin/orders` | عرض طلبات واتساب وتغيير حالتها |
| `/admin/settings` | إعدادات المتجر (الاسم، الشعار، واتساب...) |

---

## كيف أغيّر رقم واتساب؟

1. افتح `/admin/settings`
2. في قسم "معلومات التواصل" عدّل حقل **رقم واتساب**
3. اضغط "حفظ الإعدادات"

يتغيّر الرقم فوراً في جميع أزرار الطلب عبر الموقع.

---

## كيف أغيّر الشعار؟

1. افتح `/admin/settings`
2. في قسم "الشعار والأيقونة" اضغط **رفع صورة**
3. اختر ملف JPG / PNG / WEBP (أقل من 5MB)
4. اضغط "حفظ الإعدادات"

---

## أين تُحفظ الصور؟

| النوع | المسار |
|-------|--------|
| صور المنتجات | `public/uploads/products/` |
| صور الأقسام | `public/uploads/categories/` |
| صور الماركات | `public/uploads/brands/` |
| شعار وفيفيكون | `public/uploads/store/` |

> في production، استبدل التخزين المحلي بـ S3 أو Cloudinary.

---

## ملاحظات النشر (Production)

- [ ] غيّر `JWT_SECRET` إلى قيمة عشوائية قوية (32+ حرف)
- [ ] غيّر كلمة مرور admin الافتراضية (`admin123`)
- [ ] استخدم مستخدم MySQL مخصص (ليس root)
- [ ] تأكد أن `NODE_ENV=production`
- [ ] فعّل HTTPS
- [ ] انقل تخزين الصور إلى S3 أو CDN
- [ ] أضف rate limiting على `/api/auth/login`
- [ ] احذف أو احمِ مسار `/api/auth/login` بعد إعداد الـ admin
