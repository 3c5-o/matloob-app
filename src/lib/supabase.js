import { createClient } from '@supabase/supabase-js'
import { APP_CONFIG } from './config'
export const supabase=createClient(APP_CONFIG.supabaseUrl,APP_CONFIG.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},realtime:{params:{eventsPerSecond:10}}})
