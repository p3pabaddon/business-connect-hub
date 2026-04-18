import { supabase } from './supabase';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = 'BCy6-jD-wS-H7Z2O5Q8L9F0G1H2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9'; // Placeholder

export async function requestNotificationPermission(userId: string) {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    return subscribeUser(userId);
  }
}

async function subscribeUser(userId: string) {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    const parsed = subscription.toJSON();
    
    // Save to Supabase
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: parsed.endpoint,
      p256dh: parsed.keys?.p256dh,
      auth: parsed.keys?.auth
    });

    if (error) throw error;
    
    toast.success('Bildirimler başarıyla açıldı!');
    return true;
  } catch (error) {
    console.error('Subscription error:', error);
    toast.error('Bildirim aboneliği sırasında bir hata oluştu');
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
