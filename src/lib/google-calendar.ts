
import { supabase } from "./supabase";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = window.location.origin + "/oauth/google/callback";
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly";

export const getGoogleAuthUrl = (staffId: string) => {
  if (!CLIENT_ID) {
    throw new Error("VITE_GOOGLE_CLIENT_ID .env dosyasında bulunamadı.");
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", staffId); // Pass staffId in state to know who we are connecting
  
  return url.toString();
};

export const disconnectGoogleCalendar = async (staffId: string) => {
  const { error } = await supabase
    .from("staff")
    .update({
      google_refresh_token: null,
      google_calendar_id: null,
      google_sync_enabled: false
    })
    .eq("id", staffId);
    
  if (error) throw error;
};

export const syncAppointmentToGoogle = async (appointment: any) => {
  // Bu kısım normalde bir Edge Function veya backend üzerinden yapılmalıdır 
  // çünkü refresh_token ile yeni access_token almak gizli anahtar (Client Secret) gerektirir.
  console.log("Syncing appointment to Google Calendar...", appointment.id);
};
