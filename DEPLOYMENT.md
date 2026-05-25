# Yasser Phone — دليل النشر على Render + Railway + Cloudflare R2

## البنية المستخدمة

| الخدمة | الدور |
|--------|-------|
| **Render** | تشغيل Next.js (Frontend + API) |
| **Railway MySQL** | قاعدة البيانات |
| **Cloudflare R2** | تخزين الصور |

---

## الخطوة 1 — إنشاء قاعدة بيانات Railway MySQL

1. افتح [railway.app](https://railway.app) وسجّل دخولك.
2. أنشئ **New Project → Add a Service → Database → MySQL**.
3. بعد الإنشاء افتح الـ service → تبويب **Connect**.
4. انسخ **MySQL URL** — سيكون بصيغة:
   ```
   mysql://root:PASSWORD@HOST:PORT/railway
   ```
5. احفظه — ستحتاجه في متغيرات Render.

> **ملاحظة:** Railway يوفر SSL تلقائياً. إذا ظهر خطأ SSL أضف `?sslaccept=strict` لنهاية الـ URL.

---

## الخطوة 2 — إنشاء Cloudflare R2 Bucket

1. افتح [dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage**.
2. اضغط **Create bucket** → اسم مثل `yasser-phone-uploads`.
3. في إعدادات الـ bucket فعّل **Public Access** إذا أردت روابط عامة مباشرة.
   - أو استخدم **Custom Domain** لربط دومين مثل `cdn.yourdomain.com`.
4. انسخ **Public Bucket URL** من تبويب Settings (صيغة: `https://pub-XXXX.r2.dev`).

### إنشاء R2 API Token

1. في Cloudflare → **R2 → Manage API Tokens → Create API Token**.
2. الصلاحيات: **Object Read & Write** على الـ bucket الذي أنشأته.
3. انسخ:
   - **Access Key ID**
   - **Secret Access Key**
   - **Account ID** (من الشريط الجانبي الأيمن في dashboard)

---

## الخطوة 3 — رفع المشروع إلى GitHub

```bash
git add .
git commit -m "prepare for production deployment"
git push origin main
```

> **تأكد** أن `.env.local` و `.env` غير مرفوعَين (موجودان في `.gitignore`).

---

## الخطوة 4 — إنشاء Render Web Service

1. افتح [render.com](https://render.com) وسجّل دخولك.
2. اضغط **New → Web Service**.
3. اربط مستودع GitHub الخاص بالمشروع.
4. اضبط الإعدادات:

| الحقل | القيمة |
|-------|--------|
| **Name** | yasser-phone |
| **Region** | Frankfurt (EU Central) أو الأقرب لجمهورك |
| **Branch** | main |
| **Runtime** | Node |
| **Build Command** | انظر أدناه |
| **Start Command** | `npm run start` |

### Build Command المقترح

```
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

**لماذا هذا الترتيب؟**
- `npm install` — تثبيت dependencies
- `npx prisma generate` — توليد Prisma Client (لازم قبل build)
- `npx prisma migrate deploy` — تطبيق migrations على Railway MySQL (آمن في production — لا يحذف بيانات)
- `npm run build` — بناء Next.js

---

## الخطوة 5 — إضافة Environment Variables في Render

في Render → Web Service → **Environment** أضف المتغيرات التالية:

```
DATABASE_URL        = mysql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET          = [قيمة قوية عشوائية — openssl rand -base64 48]
NEXT_PUBLIC_APP_URL = https://your-app.onrender.com
NODE_ENV            = production

R2_ACCOUNT_ID       = [من Cloudflare dashboard]
R2_ACCESS_KEY_ID    = [من R2 API token]
R2_SECRET_ACCESS_KEY= [من R2 API token]
R2_BUCKET_NAME      = yasser-phone-uploads
R2_PUBLIC_BASE_URL  = https://pub-XXXX.r2.dev
```

> بعد نشر المشروع وتأكيد الدومين النهائي، حدّث `NEXT_PUBLIC_APP_URL` ليطابقه.

---

## الخطوة 6 — Deploy

1. اضغط **Create Web Service** في Render.
2. راقب Build Logs — يجب أن ترى:
   ```
   Prisma schema loaded from prisma/schema.prisma
   Applying migration `20260525004632_init`
   Database migrations applied successfully
   ✓ Compiled successfully
   ```
3. بعد انتهاء الـ build سيظهر رابط مثل: `https://yasser-phone.onrender.com`

---

## الخطوة 7 — اختبار الموقع بعد النشر

### واجهة الزبون
- [ ] `https://your-app.onrender.com/` — الصفحة الرئيسية تفتح
- [ ] `https://your-app.onrender.com/products` — قائمة المنتجات
- [ ] `https://your-app.onrender.com/offers` — العروض
- [ ] صفحة أي منتج تفتح وتعرض الصورة

### لوحة التحكم
- [ ] `https://your-app.onrender.com/admin/login` — صفحة تسجيل الدخول
- [ ] تسجيل الدخول يعمل
- [ ] إضافة منتج جديد من `/admin/products/new`

### اختبار رفع صورة في Production
1. افتح `/admin/products/new`
2. ارفع صورة للمنتج
3. تأكد أن الصورة ظهرت في preview
4. احفظ المنتج
5. افتح صفحة المنتج في واجهة الزبون
6. تأكد أن الصورة تظهر من رابط R2 مثل: `https://pub-XXXX.r2.dev/uploads/products/UUID.jpg`

### اختبار رسالة واتساب
1. اضغط "اطلب عبر واتساب" على أي منتج
2. تأكد أن الرسالة تحتوي:
   - اسم المنتج
   - السعر
   - `الصورة: https://pub-XXXX.r2.dev/uploads/products/...`
   - `رابط المنتج: https://your-app.onrender.com/products/slug`
3. تأكد أن الرابطين يفتحان بشكل صحيح (https وليس localhost)

---

## الخطوة 8 — تحديث Admin Password

بعد النشر الأول، غيّر كلمة مرور المدير من `/admin/settings` أو مباشرة عبر Railway MySQL shell:

```sql
UPDATE admins SET password_hash = '$2b$10$...' WHERE email = 'admin@yasserphone.mr';
```

> استخدم bcrypt hash generator لتوليد hash جديد.

---

## ملاحظات مهمة

### Render Free Tier
- الـ instance ينام بعد 15 دقيقة من عدم الاستخدام.
- أول طلب بعد النوم يأخذ 30-60 ثانية.
- للإنتاج الحقيقي استخدم **Starter plan** ($7/شهر).

### Prisma في Production
- `prisma migrate deploy` آمن تماماً — يطبق فقط migrations غير المطبقة.
- لا تستخدم `prisma migrate dev` في production.
- لا تستخدم `prisma db push` في production.

### الصور المحلية القديمة
- أي صور رُفعت في التطوير المحلي (`/uploads/...`) لن تظهر في production.
- يجب إعادة رفعها من لوحة التحكم في production.

---

## Development vs Production

| الميزة | Development | Production |
|--------|-------------|------------|
| تخزين الصور | `public/uploads/` | Cloudflare R2 |
| قاعدة البيانات | MySQL محلي | Railway MySQL |
| App URL | `http://localhost:3000` | `https://your-app.onrender.com` |
| Migrations | `prisma migrate dev` | `prisma migrate deploy` |
