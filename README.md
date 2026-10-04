# مطلوب

منصة عربية RTL للطلبات والعروض: شراء، خدمات، إيجار ومهام. المشروع مبني ليعمل كنسخة ويب على GitHub Pages وكتطبيق Android عبر Capacitor.

## البنية

- React + Vite للواجهة.
- Supabase Auth / Postgres / Realtime / Storage.
- OneSignal App: `matloob` (تهيئة الإرسال الفعلي تتم بعد تثبيت بيانات المنصة المناسبة).
- رفع مباشر للوسائط حتى 20MB عبر Supabase Storage.
- بوابة Telegram/Railway للملفات الأكبر مصممة كطبقة خادم منفصلة حتى لا تظهر أي أسرار في تطبيق المستخدم.

## الأمان

لا يتم وضع `service_role` أو OneSignal REST API Key أو Telegram Bot Token أو مفاتيح توقيع Android داخل المستودع. نسخة المستخدم تستخدم فقط Supabase Publishable Key مع RLS.

رقم مقدم الخدمة محفوظ في جدول خاص ولا يظهر مباشرة. الإعداد الافتراضي هو التواصل داخل التطبيق، مع خيار إظهار الرقم بعد قبول العرض أو دائماً حسب اختيار مقدم الخدمة.

## التشغيل المحلي

```bash
npm install
npm run dev
```

## الويب

Workflow باسم `Deploy Web` يبني `dist` وينشره إلى GitHub Pages عند الدفع إلى `main`.

## Android

Workflow باسم `Build Android Test APK` يبني APK تجريبي Debug. النسخة النهائية Release يجب أن تستخدم keystore ثابتاً محفوظاً خارج المستودع/داخل GitHub Secrets حتى تبقى التحديثات قابلة للتثبيت فوق النسخة السابقة.

Package ID: `com.matloob.app`

## قاعدة البيانات

تم إنشاء البنية الأساسية في Supabase بمهاجرتين:

- `initial_matloob_core`
- `security_and_performance_hardening`

تشمل الملفات المنطقية: الحسابات العامة، بيانات مقدم الخدمة، طرق التواصل الخاصة، الفئات، الطلبات، العروض، المحادثات، الرسائل، المفضلة، التقييمات، الإشعارات، البلاغات والحظر.
