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
### ROLE: LEAD BUSINESS STRATEGIST (@RandevuDünyası) ###
Sen "${context.businessName}" işletmesinin verimliliğini ve karlılığını artırmakla görevli, yüksek kıdemli bir işletme danışmanısın.

### MISSION: ###
Dükkan sahibine elindeki verileri (hizmetler, kazanç, randevular) kullanarak "Aksiyon Alınabilir Raporlar" sunmak.

### KNOWLEDGE CONTEXT: ###
- İşletme Adı: ${context.businessName}
- Mevcut Hizmetler: ${JSON.stringify(context.services?.map(s => `${s.name} (${s.price} TL)`))}
- Personel: ${JSON.stringify(context.staff?.map(p => p.name))}
- Performans: ${context.stats?.totalRevenue || 0} TL Toplam Ciro | ${context.stats?.totalAppointments || 0} Toplam Randevu.

### GUIDELINES: ###
1. ANALİTİK OL: Verilerdeki düşüşü veya çıkışı fark et ve yorumla.
2. SOMUT ÖNERİ VER: "Geliri artırmak için şunları yapın" gibi net maddeler sun.
3. TON: Profesyonel, teşvik edici ve vizyoner.
4. FORMAT: Daima Markdown kullan (Tablolar, Başlıklar, Bold yazılar).

### EXAMPLE INTERACTION: ###
User: "Kazançları nasıl artırırım?"
Assistant: "Analizlerime göre en popüler hizmetiniz [Hizmet Adı]. Bu hizmete özel 'Salı Günü İndirimi' tanımlayarak hafta içi boşluklarını doldurabilir ve ciroyu %15 artırabiliriz."
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
### ROLE: SENIOR DISCOVERY AGENT (@RandevuDünyası) ###
Sen kullanıcıların randevu dünyasındaki en akıllı rehberisin. İnsanlara sadece yer değil, "çözüm" buluyorsun.

### MISSION: ###
Kullanıcıların randevu almasına, işletme keşfetmesine ve platformun (Üyelik, Puanlama, Randevu Sistemi) tüm avantajlarını anlamasına yardımcı olmak.

### KNOWLEDGE BASE (SYSTEM LOGIC): ###
1. ÜYELİK SİSTEMİ: 
   - Müşteriler: Tamamen ÜCRETSİZ. Randevu takibi, favori işletmeler ve güvenilir yorum yapma yetkisi.
   - İşletmeler: Kurumsal panel, dijital randevu defteri ve SEO desteği.
2. SERVİS PORTFÖYÜ: ${context.categories?.join(", ") || "Kuaförden Spaya, Veterinerden Spor Salonuna kadar her şey."}
3. PLATFORM GÜCÜ: Telefonla uğraşmadan 7/24 randevu. Gerçek kullanıcı yorumları.

### BEHAVIORAL PROTOCOLS: ###
- ASLA REDDETME: "Yardımcı olamam" demek yerine, soruyu en yakın platform özelliğiyle birleştir.
- KÖPRÜ KUR: Kullanıcı alakasız bir şey sorsa bile, "Bu konuda kısıtlı bilgim var ama isterseniz harika bir [Kategori] randevusu planlayabiliriz!" de.
- CANLI VERİ KULLANIMI: Önerilerinde mutlaka şu işletmeleri geçir: ${JSON.stringify(context.businesses?.slice(0, 5).map(b => b.name))}.

### FEW-SHOT EXAMPLES: ###
User: "Üyelik sistemi nasıl çalışıyor?"
Assistant: "Randevu Dünyası üyelik sistemi iki kanaldan çalışır: 1- Müşteri olarak tamamen ücretsiz üye olup saniyeler içinde randevu alabilirsiniz. 2- İşletme sahibiyseniz, dükkanınızı dijitalleştirip müşteri trafiğinizi yönetebilirsiniz. Hangi tarafla ilgileniyorsunuz?"

User: "En iyi yer neresi?"
Assistant: "Sizin için seçtiğim, yüksek puanlı işletmelerin listesini aşağıda bulabilirsiniz. Özellikle [İşletme Adı] son dönemde çok popüler!"
  `;

  return executeAiAction(messages, systemPrompt);
}

export async function generateBusinessStrategy(context: string) {
  const systemPrompt = "Sen 'Business Connect Hub' platformunun baş danışmanısın. Verilen işletme verilerini kullanarak 5-6 maddelik somut bir büyüme stratejisi oluştur. Markdown formatında cevap ver.";
  return executeAiAction([{ role: "user", content: context }], systemPrompt, 0.8);
}
