# مطلوب

منصة عربية RTL للطلبات والعروض: شراء، خدمات، إيجار ومهام.

## التقنية
React + Vite + Capacitor + Supabase + OneSignal. بوابة الملفات الكبيرة تعمل على Railway، بينما البيانات الأساسية والمحادثات والحماية تعتمد Supabase مع RLS.

## Android
Package ID: `com.matloob.app`

## الأمان
لا يتم وضع Service Role أو Telegram Bot Token أو مفاتيح التوقيع داخل المستودع. مفاتيح العميل العامة فقط موجودة في الواجهة، والبيانات محمية بـ RLS.
