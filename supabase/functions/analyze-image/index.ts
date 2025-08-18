// Supabase Edge Function: analyze-image
// Deno runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "*",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json();
    const image: string | undefined = body?.image; // data URL or remote URL
    if (!image) {
      return new Response(JSON.stringify({ error: "Missing image in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const systemPrompt = `Eres un asistente experto en nutrición y análisis de platos a partir de imágenes.
Devuelve únicamente un objeto JSON VÁLIDO con este formato y números en unidades indicadas (sin texto adicional):
{
  "name": string,                      // nombre del plato identificado
  "totalWeightGrams": number,          // peso total estimado en gramos
  "imageUrl": string | null,           // opcional, puedes repetir la URL/base64 recibida
  "nutrition": {
    "calories": number,                // kcal totales
    "protein": number,                 // gramos
    "fat": number,                     // gramos
    "carbs": number,                   // gramos
    "fiber": number,                   // gramos
    "sugars": number,                  // gramos
    "addedSugars": number,             // gramos
    "sodium": number,                  // mg
    "glycemicIndex": number,           // 0-100 estimado según ingredientes y preparación
    "score": number                    // 0-100 salud/densidad nutricional
  },
  "recommendations": string[],         // 2-4 recomendaciones
  "detailsText": string                // breve explicación del análisis
}`;

    const userPrompt = `Analiza la imagen del plato y estima los campos solicitados. Si el plato parece un estofado de carne con verduras u otros guisos, identifícalo correctamente (evita clasificarlo como ensalada si no lo es).`;

    // Use OpenAI Chat Completions with vision-capable model
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "input_image", image_url: image },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: "OpenAI error", detail: text }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";

    // content should already be valid JSON due to response_format
    let result: any;
    try {
      result = typeof content === "string" ? JSON.parse(content) : content;
    } catch (_) {
      // Fallback: try to extract JSON block
      const match = String(content).match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : {};
    }

    // Basic normalization and safety
    result = {
      name: result?.name ?? "Plato identificado",
      totalWeightGrams: Number(result?.totalWeightGrams ?? 350),
      imageUrl: image,
      nutrition: {
        calories: Number(result?.nutrition?.calories ?? 500),
        protein: Number(result?.nutrition?.protein ?? 30),
        fat: Number(result?.nutrition?.fat ?? 20),
        carbs: Number(result?.nutrition?.carbs ?? 45),
        fiber: Number(result?.nutrition?.fiber ?? 6),
        sugars: Number(result?.nutrition?.sugars ?? 8),
        addedSugars: Number(result?.nutrition?.addedSugars ?? 0),
        sodium: Number(result?.nutrition?.sodium ?? 700),
        glycemicIndex: Number(result?.nutrition?.glycemicIndex ?? 55),
        score: Number(result?.nutrition?.score ?? 70),
      },
      recommendations: Array.isArray(result?.recommendations) ? result.recommendations.slice(0, 4) : [],
      detailsText: result?.detailsText ?? "Valores estimados automáticamente a partir de la imagen.",
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unhandled error", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
