import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // CORS Check
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { messages, systemPrompt, temperature } = body
    
    // Log request for debugging
    console.log(`AI Request received. Messages: ${messages?.length}, Temperature: ${temperature}`)
    
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!apiKey) {
      console.error("CRITICAL: OPENAI_API_KEY is missing in Supabase Secrets!")
      return new Response(
        JSON.stringify({ error: "Supabase Secrets: OPENAI_API_KEY eksik!" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: temperature || 0.3,
        max_tokens: 1000, // Vision analizleri için gerekli
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error("OpenAI API Error:", data)
      return new Response(
        JSON.stringify({ error: data.error?.message || "OpenAI hatası", details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error("Function Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
