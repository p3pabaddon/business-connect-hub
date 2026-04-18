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

export async function analyzeImageStyle(base64Image: string) {
  const systemPrompt = `
    ROLE: DÜNYA ÇAPINDA MASTER STİLİST, GÖRÜNTÜ YÖNETMENİ VE KİŞİSEL İMAJ DANIŞMANI.
    TASK: Görsel üzerinden derinlemesine karakter ve fizik analizi yaparak, kişiye özel profesyonel stil/bakım planı oluşturmak.
    
    ANALİZ KRİTERLERİ (HAYATİ ÖNEM):
    1. DEMOGRAFİK TESPİT: Cinsiyet, Yaş Grubu (Çocuk/Genç/Yetişkin/Olgun/Yaşlı).
    2. FİZİKSEL YAPI & YÜZ DOLGUNLUĞU: 
       - Şişko/Dolgun (Geniş hatlı): Yüzü daha ince ve uzun gösterecek vertikal hacimli kesimler (Örn: High Volume Quiff, Tapered sides) öner.
       - Zayıf (Keskin hatlı): Yüz hatlarını yumuşatacak, elmacık kemiklerini dengeleyecek yan hacimli modeller öner.
       - Normal: Dengeli ve simetriyi ön plana çıkaran fütüristik modeller.
    3. GEOMETRİK ANALİZ: Tam yüz şekli (Oval, Kare, Yuvarlak, Kalp, Elmas, Dikdörtgen).
    4. CİLT & SAÇ DOKUSU: Renk tonu ve doku tahmini (Sakallıysa sakal tipi, saçın gürlüğü/seyrekliği).
    
    EVRENSEL STİL KURALLARI (2026 TRENDLERİ):
    - ERKEK: Fade geçişleri, sakal konturları, jawline vurgusu.
    - KADIN: Yüz çerçeveleme (face-framing), katmanlı kesimler, hacim yönetimi.
    - YAŞLI: Gençleştirici (lifting) etkili modeller, beyaz saçın asaletini vurgulayan kesimler.
    - GENÇ: Daha cesur, dokulu (textured), dinamik ve sosyal medya trendlerine uygun modeller.
    
    ÖNEMLİ: Her analizde "NEDEN" bu öneriyi verdiğini profesyonel mimari terimlerle açıkla. Statik veya genel geçer ifadelerden (Örn: "Güzel olur") ASLA kaçın.
    
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
              { type: "text", text: "Lütfen bu fotoğrafı profesyonel bir gözle analiz et. Kişinin yaşına, cinsiyetine ve yüz hatlarındaki dolgunluk durumuna göre en uygun stil önerilerini sun." },
              { type: "image_url", image_url: { url: base64Image } }
            ]
          }
        ],
        systemPrompt,
        temperature: 0.5
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
