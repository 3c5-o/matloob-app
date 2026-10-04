#!/usr/bin/env bash
set -euo pipefail

: "${ANDROID_KEYSTORE_B64:?ANDROID_KEYSTORE_B64 is required}"
: "${ANDROID_KEYSTORE_PASSWORD:?ANDROID_KEYSTORE_PASSWORD is required}"
: "${ANDROID_KEY_ALIAS:?ANDROID_KEY_ALIAS is required}"
: "${ANDROID_KEY_PASSWORD:?ANDROID_KEY_PASSWORD is required}"

BUILD_TOOLS="${ANDROID_HOME}/build-tools/35.0.0"
KEYSTORE="/tmp/matloob-release.jks"
ALIGNED="/srv/matloob-release-aligned.apk"
SIGNED="/srv/matloob.apk"

printf '%s' "${ANDROID_KEYSTORE_B64}" | base64 -d > "${KEYSTORE}"
chmod 600 "${KEYSTORE}"

"${BUILD_TOOLS}/zipalign" -f -p 4 /srv/app-release-unsigned.apk "${ALIGNED}"

"${BUILD_TOOLS}/apksigner" sign \
  --ks "${KEYSTORE}" \
  --ks-key-alias "${ANDROID_KEY_ALIAS}" \
  --ks-pass "env:ANDROID_KEYSTORE_PASSWORD" \
  --key-pass "env:ANDROID_KEY_PASSWORD" \
  --out "${SIGNED}" \
  "${ALIGNED}"

"${BUILD_TOOLS}/apksigner" verify --verbose --print-certs "${SIGNED}"
rm -f "${KEYSTORE}" "${ALIGNED}"

cat > /srv/index.html <<'HTML'
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#06100f">
  <title>مطلوب — Android</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#06100f;color:#f4fffb;font-family:system-ui,sans-serif}
    main{width:min(92%,520px);padding:32px;border-radius:26px;background:#0b1917;border:1px solid rgba(25,230,174,.2);text-align:center}
    h1{margin:0 0 10px;font-size:38px} p{color:#98aaa5;line-height:1.8}
    a{display:inline-block;margin-top:18px;padding:14px 22px;border-radius:14px;background:#19e6ae;color:#032118;text-decoration:none;font-weight:800}
    small{display:block;margin-top:18px;color:#60736e}
  </style>
</head>
<body><main><h1>مطلوب</h1><p>نسخة Android الموقعة للإصدار 1.0.0</p><a href="/matloob.apk">تحميل APK</a><small>Package: com.matloob.app</small></main></body>
</html>
HTML

exec python3 -m http.server "${PORT:-8080}" --bind 0.0.0.0 --directory /srv
