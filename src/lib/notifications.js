import { Capacitor } from '@capacitor/core'
import { APP_CONFIG } from './config'

let nativeInitialized = false
let webInitialized = false

async function initNative(userId) {
  try {
    const { default: OneSignal } = await import('@onesignal/capacitor-plugin')
    if (!nativeInitialized) {
      await OneSignal.initialize(APP_CONFIG.oneSignalAppId)
      nativeInitialized = true
    }
    if (userId) {
      await OneSignal.login(userId)
      await OneSignal.User.setLanguage('ar')
    }
    return true
  } catch (error) {
    console.warn('OneSignal native init skipped', error)
    return false
  }
}

function loadWebScript() {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-onesignal-sdk]')) return resolve()
    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.defer = true
    script.dataset.onesignalSdk = '1'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function initWeb(userId) {
  try {
    await loadWebScript()
    window.OneSignalDeferred = window.OneSignalDeferred || []
    return await new Promise((resolve) => {
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          if (!webInitialized) {
            await OneSignal.init({
              appId: APP_CONFIG.oneSignalAppId,
              allowLocalhostAsSecureOrigin: true,
              serviceWorkerPath: 'OneSignalSDKWorker.js',
              serviceWorkerParam: { scope: './' },
              notifyButton: { enable: false }
            })
            webInitialized = true
          }
          if (userId) await OneSignal.login(userId)
          resolve(true)
        } catch (error) {
          console.warn('OneSignal web init skipped', error)
          resolve(false)
        }
      })
    })
  } catch (error) {
    console.warn('OneSignal web SDK unavailable', error)
    return false
  }
}

export async function initNotifications(userId) {
  if (!APP_CONFIG.oneSignalAppId) return false
  return Capacitor.isNativePlatform() ? initNative(userId) : initWeb(userId)
}

export async function requestNotificationPermission() {
  try {
    if (Capacitor.isNativePlatform()) {
      const { default: OneSignal } = await import('@onesignal/capacitor-plugin')
      return await OneSignal.Notifications.requestPermission(true)
    }
    window.OneSignalDeferred = window.OneSignalDeferred || []
    return await new Promise((resolve) => {
      window.OneSignalDeferred.push(async (OneSignal) => {
        try { resolve(await OneSignal.Notifications.requestPermission()) }
        catch { resolve(false) }
      })
    })
  } catch { return false }
}

export async function logoutNotifications() {
  try {
    if (Capacitor.isNativePlatform()) {
      const { default: OneSignal } = await import('@onesignal/capacitor-plugin')
      await OneSignal.logout()
      return
    }
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => { try { await OneSignal.logout() } catch {} })
  } catch {}
}
