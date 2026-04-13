
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
    Sen "Business Connect Hub" platformunun uzman işletme danışmanısın. 
    Görevin "${context.businessName}" işletmesinin verilerini analiz ederek dükkan sahibine büyüme stratejileri sunmaktır.
    
    YETKİLERİN VE DAVRANIŞIN:
    1. İşletme performansı, randevu trendleri, hizmet verimliliği ve pazarlama konularında derinlemesine tavsiyeler ver.
    2. Kullanıcıyla profesyonel, yapıcı ve vizyoner bir tonda konuş.
    3. Eğer kullanıcı tamamen platform dışı (siyaset, magazin vb.) bir soru sorarsa, nazikçe konuyu işletme yönetimine geri çek.
    4. "Üzgünüm, yardımcı olamam" gibi keskin cümleler yerine "İşletme hedefleriniz doğrultusunda şu konuya odaklansak daha iyi olur" gibi yönlendirici ol.
    
    İŞLETME VERİLERİ (GİZLİDİR, SADECE ANALİZ İÇİN KULLAN):
    - Hizmetler: ${JSON.stringify(context.services?.map(s => `${s.name} (${s.price} TL)`))}
    - Personel: ${JSON.stringify(context.staff?.map(p => p.name))}
    - Toplam Randevu: ${context.stats?.totalAppointments || 0}
    - Bugünün Randevuları: ${context.stats?.todayAppointments || 0}
    - Toplam Kazanç: ${context.stats?.totalRevenue || 0} TL
    
    Analizlerini bu verilere dayandır ve somut öneriler (Örn: "Salı günleri randevular az, kampanya yapalım") sun.
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
    console.error("AI Advisor Error:", err);
    throw new Error(err.error?.message || "OpenAI hatası oluştu");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function askPublicAiAdvisor(
  messages: AiMessage[],
  context: {
    businesses?: any[];
    categories?: string[];
    userLocation?: string;
  }
) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API anahtarı bulunamadı");
  }

  const systemPrompt = `
    Sen "Business Connect Hub" platformunun akıllı asistanısın. 
    Platformumuzda kullanıcılar kuaför, spor salonu, restoran gibi işletmelerden randevu alabilir.
    
    PLATFORM VERİLERİ:
    - Mevcut Kategoriler: ${context.categories?.join(", ") || "Kuaför, Berber, Güzellik Merkezi, Spor Salonu, Klinik"}
    - Bazı Örnek İşletmeler: ${JSON.stringify(context.businesses?.slice(0, 10).map(b => `${b.name} (${b.category} - ${b.city})`))}
    
    GÖREVİN:
    1. SADECE kullanıcıların kuaför, spor salonu, restoran gibi işletmelerden randevu almasına yardımcı olmaktır.
    2. Platform dışı hiçbir soruya (Yemek tarifi, genel bilgi, kodlama, film önerisi vb.) KESİNLİKLE cevap verme.
    3. Alakasız sorularda: "Ben sadece randevu ve işletme keşfi konusunda yardımcı olan bir asistanım. Lütfen platformla ilgili sorular sorun." cevabını ver.
    4. Kullanıcılara platformu kullanma konusunda yardımcı ol ve kısa, öz cevaplar ver.
    5. Eğer bir işletme hakkında spesifik bilgi istenirse ve sende yoksa, platformdan arama yapabileceğini hatırlat.
  `;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
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

export async function generateBusinessStrategy(context: string) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("API key missing");

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Sen 'Business Connect Hub' platformunun baş danışmanısın. Verilen işletme analitik verilerini kullanarak 5-6 maddelik, somut, uygulanabilir ve profesyonel bir büyüme stratejisi oluştur. Markdown formatında başlıklar kullanarak cevap ver." 
        },
        { role: "user", content: `Aşağıdaki verileri analiz et ve strateji oluştur:\n\n${context}` }
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "OpenAI API Error");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
