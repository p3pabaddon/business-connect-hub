import { supabase } from "./supabase";

interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Resilient AI call handler: Tries Supabase (Secure) first, falls back to local env (Secure local).
 */
async function executeAiAction(messages: AiMessage[], systemPrompt: string, temperature: number = 0.7) {
  console.log("AI Action starting...", { messagesCount: messages.length, systemPrompt: systemPrompt.substring(0, 50) });
  
  // Method 1: Try Supabase Edge Function (Recommended & Secure)
  try {
    console.log("Calling Supabase Edge Function: ai-advisor");
    const { data, error } = await supabase.functions.invoke("ai-advisor", {
      body: { messages, systemPrompt, temperature }
    });
    
    if (error) {
      console.warn("Supabase Function Error:", error);
    } else if (data && data.error) {
      console.warn("AI Function returned error state:", data.error);
    } else if (data && data.choices?.[0]?.message?.content) {
      console.log("Supabase AI Response successful");
      return data.choices[0].message.content;
    } else {
      console.warn("Supabase AI Response format unexpected:", data);
    }
  } catch (err) {
    console.warn("Supabase Edge Function call crashed:", err);
  }

  // Method 2: Local Env Fallback (Only works in Dev mode with .env file)
  console.log("Falling back to local OpenAI call...");
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error("CRITICAL: VITE_OPENAI_API_KEY is null in .env");
    throw new Error("AI bağlantısı kurulamadı: API Anahtarı eksik.");
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Use mini for fallback to save tokens/increase availability
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature,
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error("OpenAI Local Error:", data.error);
      throw new Error(data.error.message);
    }
    
    console.log("Local OpenAI Response successful");
    return data.choices?.[0]?.message?.content || "Yanıt oluşturulamadı.";
  } catch (err) {
    console.error("Local OpenAI call failed:", err);
    throw err;
  }
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
