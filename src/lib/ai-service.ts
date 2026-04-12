
import { createAppointment } from "./api"; // Optional: if we want AI to book

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function askAiAdvisor(
  messages: AiMessage[],
  context: {
    businessName: string;
    stats?: any;
    services?: any[];
    staff?: any[];
    appointments?: any[];
  }
) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API anahtarı bulunamadı (.env dosyasını kontrol edin)");
  }

  const systemPrompt = `
    Sen "Business Connect Hub" platformunun akıllı işletme danışmanısın. 
    Şu an "${context.businessName}" isimli işletmeye danışmanlık yapıyorsun.
    
    İŞLETME VERİLERİ:
    - Hizmetler: ${JSON.stringify(context.services?.map(s => `${s.name} (${s.price} TL)`))}
    - Personel: ${JSON.stringify(context.staff?.map(p => p.name))}
    - Toplam Randevu: ${context.stats?.totalAppointments || 0}
    - Bugünün Randevuları: ${context.stats?.todayAppointments || 0}
    - Toplam Kazanç: ${context.stats?.totalRevenue || 0} TL
    
    GÖREVİN:
    1. İşletme sahibine profesyonel, nazik ve stratejik öneriler ver.
    2. Verilere bakarak (örneğin kazanç azsa) "Şu hizmette kampanya yapabilirsin" gibi somut tavsiyelerde bulun.
    3. Sorulan soruları işletme bağlamında cevapla.
    4. Cevaplarını Türkçe, kısa ve öz tut. Gerektiğinde madde işaretleri kullan.
    5. Eğer kullanıcı personeller hakkında soru sorsa verilerdeki personelleri kullan.
  `;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Cost effective yet smart
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "OpenAI hatası oluştu");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
