
/**
 * Randevu Dünyası - Real-world Email Service (Resend Integration)
 */

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const SENDER_EMAIL = "Randevu Dünyası <noreply@randevudunyasi.com>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!RESEND_API_KEY) {
    console.warn("[Email Service] VITE_RESEND_API_KEY bulunamadı. Mail gönderimi simüle ediliyor.");
    console.log(`To: ${to}\nSubject: ${subject}\nContent: ${html}`);
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Resend API Hatası");

    return { success: true, data };
  } catch (error) {
    console.error("[Email Service] Error:", error);
    return { success: false, error };
  }
}

export const EMAIL_TEMPLATES = {
  verification: (code: string) => `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #030712; color: #ffffff; border-radius: 24px; border: 1px solid #1f2937;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0;">Randevu <span style="color: #fbbf24;">Dünyası</span></h1>
      </div>
      <div style="background-color: #111827; padding: 32px; border-radius: 20px; text-align: center; border: 1px solid #374151;">
        <h2 style="color: #ffffff; margin-top: 0;">Doğrulama Kodunuz</h2>
        <p style="color: #9ca3af; font-size: 16px;">Randevunuzu tamamlamak için aşağıdaki 6 haneli kodu kullanın.</p>
        <div style="background-color: #1f2937; padding: 24px; border-radius: 16px; margin: 24px 0; border: 1px solid #fbbf24;">
          <span style="font-size: 42px; font-weight: 900; letter-spacing: 8px; color: #fbbf24;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Bu kod 10 dakika boyunca geçerlidir.</p>
      </div>
      <div style="text-align: center; margin-top: 32px; color: #4b5563; font-size: 12px;">
        © 2026 Randevu Dünyası. Tüm hakları saklıdır.
      </div>
    </div>
  `,
  appointment_status: (bizName: string, date: string, time: string, status: string) => `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #030712; color: #ffffff; border-radius: 24px;">
      <h2>Randevu Durumu Güncellendi</h2>
      <p><strong>${bizName}</strong> işletmesindeki randevunuzun durumu <strong>${status}</strong> olarak güncellendi.</p>
      <div style="background: #111827; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p>Tarih: ${date}</p>
        <p>Saat: ${time}</p>
      </div>
      <p>Bizi tercih ettiğiniz için teşekkürler.</p>
    </div>
  `
};
