
import { supabase } from './supabase';

/**
 * Randevu Dünyası - Professional Email Service (Supabase Edge Function Integration)
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    // Supabase Edge Function'ı tetikliyoruz
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("[Email Service] Function Invoke Error:", error);
    // Fallback: Geliştirme aşamasında hala mailleri konsola basalım ki kopsun istemeyiz
    console.log(`[SIMULATED EMAIL] To: ${to}\nSubject: ${subject}`);
    return { success: false, error };
  }
}

export const EMAIL_TEMPLATES = {
  verification: (code: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #030712; color: #ffffff; border-radius: 24px;">
      <h1 style="text-align: center;">Randevu <span style="color: #fbbf24;">Dünyası</span></h1>
      <div style="background: #111827; padding: 30px; border-radius: 20px; text-align: center; border: 1px solid #374151;">
        <h2>Doğrulama Kodunuz</h2>
        <div style="font-size: 48px; font-weight: bold; color: #fbbf24; margin: 20px 0;">${code}</div>
        <p>Bu kod 10 dakika geçerlidir.</p>
      </div>
    </div>
  `,
  // ... diğer şablonlar buraya eklenebilir
};
