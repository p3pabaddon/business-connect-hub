import { supabase } from "./supabase";

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

  const { data, error } = await supabase.functions.invoke("ai-advisor", {
    body: {
      messages,
      systemPrompt,
      temperature: 0.7
    }
  });

  if (error) {
    console.error("AI Advisor Proxy Error:", error);
    throw new Error(error.message || "Edge Function çağrısı başarısız oldu.");
  }

  if (data.error) {
    throw new Error(data.error);
  }

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

  const { data, error } = await supabase.functions.invoke("ai-advisor", {
    body: {
      messages,
      systemPrompt,
      temperature: 0.7
    }
  });

  if (error) {
    console.error("Public AI Advisor Error:", error);
    throw new Error(error.message || "Edge Function çağrısı başarısız oldu.");
  }

  if (data.error) throw new Error(data.error);

  return data.choices[0].message.content;
}

export async function generateBusinessStrategy(context: string) {
  const systemPrompt = "Sen 'Business Connect Hub' platformunun baş danışmanısın. Verilen işletme analitik verilerini kullanarak 5-6 maddelik, somut, uygulanabilir ve profesyonel bir büyüme stratejisi oluştur. Markdown formatında başlıklar kullanarak cevap ver.";

  const { data, error } = await supabase.functions.invoke("ai-advisor", {
    body: {
      messages: [{ role: "user", content: `Aşağıdaki verileri analiz et ve strateji oluştur:\n\n${context}` }],
      systemPrompt,
      temperature: 0.8
    }
  });

  if (error) {
    console.error("Strategy Gen Error:", error);
    throw new Error(error.message || "Edge Function çağrısı başarısız oldu.");
  }

  if (data.error) throw new Error(data.error);

  return data.choices[0].message.content;
}
