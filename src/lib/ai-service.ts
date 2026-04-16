import { supabase } from "./supabase";

interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Resilient AI call handler: Tries Supabase (Secure) first, falls back to local env (Secure local).
 */
async function executeAiAction(messages: AiMessage[], systemPrompt: string, temperature: number = 0.7) {
  // Method 1: Try Supabase Edge Function (Recommended & Secure)
  try {
    const { data, error } = await supabase.functions.invoke("ai-advisor", {
      body: { messages, systemPrompt, temperature }
    });
    if (!error && data && !data.error && data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
  } catch (err) {
    console.warn("Supabase Edge Function call failed...", err);
  }

  // Method 2: Local Env Fallback (Only works in Dev mode with .env file)
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("AI bağlantısı kurulamadı. Lütfen Supabase Secrets veya .env ayarlarını kontrol edin.");
  }
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature,
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || "Yanıt oluşturulamadı.";
}

export async function askAiAdvisor(messages: AiMessage[], context: any) {
  const systemPrompt = `Sen Business Connect Hub platformunun uzman danışmanısın. İşletme: ${context.businessName}`;
  return executeAiAction(messages, systemPrompt);
}

export async function askPublicAiAdvisor(messages: AiMessage[], context: any) {
  const systemPrompt = `Sen Business Connect Hub asistanısın. Kategoriler: ${context.categories?.join(", ")}`;
  return executeAiAction(messages, systemPrompt);
}

export async function generateBusinessStrategy(context: string) {
  const systemPrompt = "İşletme büyüme stratejisi oluştur.";
  return executeAiAction([{ role: "user", content: context }], systemPrompt, 0.8);
}
