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
    Sen "Business Connect Hub" platformunun uzman işletme danışmanısın. 
    Görevin "${context.businessName}" işletmesinin verilerini analiz ederek dükkan sahibine büyüme stratejileri sunmaktır.
    
    YETKİLERİN VE DAVRANIŞIN:
    1. İşletme performansı, randevu trendleri, hizmet verimliliği ve pazarlama konularında derinlemesine tavsiyeler ver.
    2. Kullanıcıyla profesyonel, yapıcı ve vizyoner bir tonda konuş.
    3. Analizlerini paylaşılan verilere dayandır ve somut öneriler sun.
    
    İŞLETME VERİLERİ (GİZLİDİR):
    - Hizmetler: ${JSON.stringify(context.services?.map(s => `${s.name} (${s.price} TL)`))}
    - Personel: ${JSON.stringify(context.staff?.map(p => p.name))}
    - Toplam Randevu: ${context.stats?.totalAppointments || 0}
    - Bugünün Randevuları: ${context.stats?.todayAppointments || 0}
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
    Sen "Business Connect Hub" platformunun akıllı asistanısın. 
    Platformumuzda kullanıcılar kuaför, spor salonu, restoran gibi işletmelerden randevu alabilir.
    
    PLATFORM VERİLERİ:
    - Mevcut Kategoriler: ${context.categories?.join(", ") || "Kuaför, Berber, Güzellik Merkezi, Spor Salonu, Klinik"}
    - Bazı Örnek İşletmeler: ${JSON.stringify(context.businesses?.slice(0, 10).map(b => `${b.name} (${b.category} - ${b.city})`))}
    
    GÖREVİN:
    1. SADECE kullanıcıların randevu almasına yardımcı olmaktır.
    2. Platform dışı hiçbir soruya cevap verme.
  `;

  return executeAiAction(messages, systemPrompt);
}

export async function generateBusinessStrategy(context: string) {
  const systemPrompt = "Sen 'Business Connect Hub' platformunun baş danışmanısın. Verilen işletme verilerini kullanarak 5-6 maddelik somut bir büyüme stratejisi oluştur. Markdown formatında cevap ver.";
  return executeAiAction([{ role: "user", content: context }], systemPrompt, 0.8);
}
