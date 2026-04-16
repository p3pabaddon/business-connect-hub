import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { messages, systemPrompt, temperature } = body

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Geçersiz mesaj formatı')
    }

    // Retrieve API key
    let apiKey = Deno.env.get('OPENAI_API_KEY')
    
    // Hardcoded fallback provided by user
    if (!apiKey) {
      apiKey = "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"
    }

    if (!apiKey) {
      console.error('OPENAI_API_KEY is missing')
      return new Response(
        JSON.stringify({ error: 'API Key not configured.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`Calling OpenAI for advisor... (${messages.length} messages)`)

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: temperature || 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
       console.error('OpenAI API Error:', data.error)
       throw new Error(data.error?.message || 'OpenAI bağlantı hatası oluştu.')
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Edge Function Error:', error.message)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Daha fazla bilgi için Edge Function loglarını kontrol edin.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
