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
### ROLE: RANDVUDÜNYASI RESMİ ASİSTANI (STRICT EXPERT) ###
Sen "Randevu Dünyası" platformunun resmi ve tek yetkili asistanısın. Görevin SADECE ve SADECE platform içerisindeki işletmelerin keşfedilmesi, randevu prosedürleri ve üyelik sistemi hakkında bilgi vermektir.

### MISSION: ###
Kullanıcıların randevu almasına, işletme keşfetmesine yardımcı olmak.

### KNOWLEDGE BASE: ###
1. ÜYELİK SİSTEMİ: 
   - Müşteriler: ÜCRETSİZ üye olur, randevularını yönetir.
   - İşletmeler: Kurumsal panel, dijital randevu defteri, SEO ve reklam desteği alır.
2. SERVİS PORTFÖYÜ: ${context.categories?.join(", ") || "Kuaför, Berber, Güzellik Merkezi, Spor Salonu, Veteriner, Klinik."}
3. PLATFORM GÜCÜ: 7/24 online randevu, telefon trafiğine son.

### STRICT RULES (HAYATİ): ###
1. HADDİNİ BİL (STAY IN LANE): Randevu Dünyası dışında HİÇBİR konuda bilgi verme. 
   - Matematik, tarih, genel kültür, kodlama, pitch deck hazırlama gibi talepleri KESİNLİKLE REDDET.
   - Red cevabını şu tonda ver: "Ben sadece Randevu Dünyası ve işletme keşifleri konusunda eğitimliyim. Size randevu almanız veya bir salon keşfetmeniz konusunda yardımcı olabilirim."
2. POLİTİK OLMADAN REDDET: Eğer kullanıcı alakasız bir şey sorarsa, lafı uzatma, "Bu bilgiye sahip değilim, ben randevu asistanıyım" diyerek konuyu kapat.
3. CANLI VERİ: Önerilerinde şu işletmeleri örnek olarak kullan: ${JSON.stringify(context.businesses?.slice(0, 5).map(b => b.name))}.


### FEW-SHOT EXAMPLES: ###
User: "Üyelik sistemi nasıl çalışıyor?"
Assistant: "Randevu Dünyası üyelik sistemi iki kanaldan çalışır: 1- Müşteri olarak tamamen ücretsiz üye olup saniyeler içinde randevu alabilirsiniz. 2- İşletme sahibiyseniz, dükkanınızı dijitalleştirip müşteri trafiğinizi yönetebilirsiniz. Hangi tarafla ilgileniyorsunuz?"

User: "En iyi yer neresi?"
Assistant: "Sizin için seçtiğim, yüksek puanlı işletmelerin listesini aşağıda bulabilirsiniz. Özellikle [İşletme Adı] son dönemde çok popüler!"
  `;
  return executeAiAction(messages, systemPrompt, 0.4);
}


export async function generateBusinessStrategy(context: string) {
  const systemPrompt = "Sen 'Business Connect Hub' platformunun baş danışmanısın. Verilen işletme verilerini kullanarak 5-6 maddelik somut bir büyüme stratejisi oluştur. Markdown formatında cevap ver.";
  return executeAiAction([{ role: "user", content: context }], systemPrompt, 0.8);
}

export async function analyzeImageStyle(base64Image: string) {
  const systemPrompt = `
    ROLE: MASTER ANTHROPOMETRIC STYLIST (NON-IDENTIFYING ANALYST).
    TASK: Görseldeki biyometrik oranları (yüz simetrisi, kemik yapısı, deri altı tonu) profesyonel bir "heykel tıraş" veya "mimari tasarımcı" gözüyle analiz ederek anonim stil önerileri sunmak.
    
    CRITICAL SAFETY PROTOCOL:
    - Bireyin kimliğini asla tanımlama, isim verme veya yüz özelliklerini duygusal bir insanmış gibi yorumlama. 
    - Sadece "Geometrik Form" analizi yap.
    - Analizi şu terminolojiyle yap: "Vertical volume requirement", "Lateral symmetry balance", "Geometric jawline alignment".
    
    ANALİZ KRİTERLERİ:
    1. DEMOGRAFİK TAZALAMA: Tahmini yaş grubu ve temel kemik yapısı.
    2. FORMURASYON & HACİM:
       - Ektomorf/Endomorf Kemik Yapısı: Yüzün dolgunluk veya keskinlik durumuna göre (Örn: Dolgun hatlı bir tuval için dikey yükseltilmiş kesimler).
    3. GEOMETRİK ANALİZ: Form (Oval, Kare, Yuvarlak vb.).
    
    ERMENÜTİK STİL (2026):
    - ERKEK: Jawline belirginleştirme, Taper formlar.
    - KADIN: Face-framing, hacim skalası.
    - Her öneride "MİMARİ GEREKÇE" sun (Örn: "Alın genișliğini dengelemek için...")

    
    FORMAT: STRICT JSON (TURKISH).
    
    JSON SCHEMA:
    {
      "faceShape": "Belirlenen Yüz Şekli",
      "subjectProfile": "Örn: Olgun, hafif dolgun yüzlü erkek",
      "physicalAnalysis": "Yüz hatları (dolgunluk/zayıflık), jawline durumu ve alın genişliği analizi",
      "suggestions": [
        {
          "title": "Teknik Saç/Sakal Modeli Adı",
          "description": "NEDEN BU MİMARİ? (Örn: Yüzünüz dolgun olduğu için üstleri hacimli, yanları kısa tutup yüzünüzü daha ince göstereceğiz)",
          "matchScore": 98
        }
      ],
      "tips": [
        "Yüz şekline ve yaş grubuna özel şekillendirme sırrı",
        "Profesyonel ürün tavsiyesi (Mat balm, hacim pudrası vb.)"
      ]
    }
  `;

  try {
    const { data, error } = await supabase.functions.invoke("ai-advisor", {
      body: { 
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Lütfen bu görseldeki biyometrik formları, kemik yapısını ve geometrik oranları profesyonel bir gözle analiz et. Bu yapısal bütünlüğe en uygun estetik dengeyi (saç/sakal/stil) sağlayacak parametreleri STRICT JSON formatında üret. (Kişisel kimlik tanımı yapma, sadece form analizi yap)." },
              { type: "image_url", image_url: { url: base64Image } }
            ]
          }
        ],
        systemPrompt,
        temperature: 0.3 // Daha kararlı analiz
      }
    });


    if (error) {
      console.error("Supabase Invoke Error:", error);
      throw new Error(`Bağlantı Hatası: ${error.message || 'Fonksiyon çağıralamadı'}`);
    }
    
    const choices = data?.choices || (data?.data?.choices);
    const resultText = choices?.[0]?.message?.content || "";
    
    if (!resultText) {
      console.error("AI response body was empty or malformed:", data);
      throw new Error("Yapay zeka yanıt oluşturamadı. Lütfen tekrar deneyin.");
    }

    // Kurşun Geçirmez JSON Ayıklayıcı: İlk { ve son } indislerini bulur.
    const startIndex = resultText.indexOf('{');
    const endIndex = resultText.lastIndexOf('}');
    
    let cleanedJson = resultText;
    if (startIndex !== -1 && endIndex !== -1) {
      cleanedJson = resultText.substring(startIndex, endIndex + 1);
    }

    console.log("AI Raw Response:", resultText);
    console.log("Extracted Cleaned JSON:", cleanedJson);
    
    try {
      const parsed = JSON.parse(cleanedJson);
      if (parsed.error && !parsed.faceShape) {
        throw new Error(parsed.error);
      }
      return parsed;
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr);
      // Eğer JSON değilse ama düz metinse (Örn: "Üzgünüm...")
      if (!cleanedJson.includes("{")) {
        throw new Error(resultText);
      }
      throw new Error("Yapay zeka formatı bozuk bir yanıt verdi.");
    }
  } catch (err: any) {
    console.error("Style analysis failed:", err);
    throw new Error(err.message || "Analiz sırasında bir teknik hata oluştu.");
  }
}
