import { supabase } from "./supabase";

interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Unified AI call handler: Uses Supabase Edge Function (Secure & Integrated).
 */
async function executeAiAction(messages: AiMessage[], systemPrompt: string, temperature: number = 0.7) {
  try {
    const { data, error } = await supabase.functions.invoke("ai-advisor", {
      body: { messages, systemPrompt, temperature }
    });
    
    if (error) {
      console.error("Supabase Function Invoke Error:", error);
      // provide more context for specific supabase errors
      if (error.message?.includes("non-2xx")) {
        throw new Error(`Edge Function Hatası: Fonksiyon (ai-advisor) bulunamadı veya Supabase tarafında bir hata oluştu. Lütfen fonksiyonun 'supabase functions deploy ai-advisor' komutuyla yüklendiğinden emin olun.`);
      }
      throw new Error(error.message);
    }

    if (data?.error) {
      console.error("AI Function returned business error:", data.error);
      throw new Error(`AI Operasyon Hatası: ${data.error}`);
    }

    return data.choices?.[0]?.message?.content || "Yanıt oluşturulamadı.";
  } catch (err: any) {
    console.error("AI execution failed:", err);
    throw err;
  }
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
    Sen "Randevu Dünyası" platformunun Baş İşletme Stratejistisin. 
    Görevin "${context.businessName}" işletmesinin verilerini analiz ederek dükkan sahibine somut büyüme stratejileri sunmaktır.
    
    YETKİLERİN VE ANALİZ ALANLARIN:
    1. Gelir Analizi: Mevcut kazancı artırmak için hizmet fiyatlandırması veya kampanya (Flash Discount) önerileri sun.
    2. Personel Analizi: Personel verimliliğini değerlendir (varsa).
    3. Müşteri İlişkileri: Yorumlara verilecek cevaplar ve müşteri sadakati üzerine tavsiyeler ver.
    4. Sektörel Trendler: İşletmenin bulunduğu kategoriye göre modern trendleri öner.
    
    YAZIM TARZI:
    - Profesyonel, motivasyonel ve aksiyon odaklı konuş.
    - Markdown (tablo, kalın yazı, listeler) kullanarak raporlama yap.
    - Veriye dayanmayan genel tavsiyelerden kaçın, eldeki verilere odaklan.
    
    İŞLETME VERİLERİ (GİZLİDİR):
    - Hizmetler: ${JSON.stringify(context.services?.map(s => `${s.name} (${s.price} TL)`))}
    - Personel Kadrosu: ${JSON.stringify(context.staff?.map(p => p.name))}
    - Toplam Randevu: ${context.stats?.totalAppointments || 0}
    - Bugünün Performansı: ${context.stats?.todayAppointments || 0} Randevu, ${context.stats?.todayRevenue || 0} TL Kazanç.
    - Toplam Kazanç: ${context.stats?.totalRevenue || 0} TL
  `;

  return executeAiAction(messages, systemPrompt);
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
    Sen "Randevu Dünyası" platformunun akıllı Keşif Asistanısın. 
    Kullanıcıların kuaför, spor salonu, güzellik merkezi gibi hizmet noktalarını bulmalarına ve sistemin nasıl çalıştığını anlamalarına yardımcı olursun.
    
    PLATFORM HAKKINDA TEMEL BİLGİLER:
    1. Üyelik: Kullanıcılar ücretsiz üye olup randevularını takip edebilir. İşletmeler ise kurumsal panel üzerinden hizmetlerini yönetir.
    2. Kategoriler: Berber, Kuaför, Güzellik Merkezi, Spa/Masaj, Klinik (Lazer vb.), Veteriner, Spor Salonu, Diyetisyen.
    3. Özellikler: Kullanıcılar işletmelere yorum yapabilir, puan verebilir ve "faydalı" yorumları oylayabilirler.
    4. Randevu: Platform üzerinden online randevu almak hızlı ve ücretsizdir.
    
    DAVRANIŞ KURALLARI:
    - Asla "yardımcı olamıyorum" gibi kısıtlayıcı bir dil kullanma. 
    - Eğer platform dışı bir soru gelirse, nazikçe konuyu randevu hizmetlerimize veya mevcut işletme kategorilerine geri getir.
    - Kullanıcıya öneri sunarken listedeki gerçek işletmeleri önceliğe al.
    - Tonun: Yardımsever, enerjik ve sonuç odaklı olmalı.
    
    GÜNCEL VERİLER:
    - Mevcut Hizmet Dalları: ${context.categories?.join(", ") || "Kuaför, Berber, Güzellik Merkezi, Spor Salonu, Klinik"}
    - Önerilebilecek İşletmeler (İlk 10): ${JSON.stringify(context.businesses?.slice(0, 10).map(b => `${b.name} (${b.category} - ${b.city})`))}
  `;

  return executeAiAction(messages, systemPrompt);
}

export async function generateBusinessStrategy(context: string) {
  const systemPrompt = "Sen 'Business Connect Hub' platformunun baş danışmanısın. Verilen işletme verilerini kullanarak 5-6 maddelik somut bir büyüme stratejisi oluştur. Markdown formatında cevap ver.";
  return executeAiAction([{ role: "user", content: context }], systemPrompt, 0.8);
}
