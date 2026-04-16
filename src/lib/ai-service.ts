import { supabase } from "./supabase";

interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Resilient AI call handler: Tries Supabase first, falls back to direct OpenAI call.
 */
async function executeAiAction(messages: AiMessage[], systemPrompt: string, temperature: number = 0.7) {
  // Method 1: Try Supabase Edge Function
  try {
    const { data, error } = await supabase.functions.invoke("ai-advisor", {
      body: { messages, systemPrompt, temperature }
    });
    if (!error && data && !data.error && data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
  } catch (err) {
    console.warn("Supabase failed, falling back to direct call...", err);
  }

  // Method 2: Direct Fallback (Uses your key directly)
  const apiKey = "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";
  
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
