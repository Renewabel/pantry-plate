import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64, imageMimeType } = req.body;

    if (!imageBase64 || !imageMimeType) {
      return res.status(400).json({ error: "Missing image data" });
    }

    const message = await client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageMimeType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Analiza esta imagen de un recibo de compra. Extrae todos los items/productos visibles.

Para cada item, proporciona:
- name: nombre del producto
- quantity: cantidad (número)
- unit: unidad (g, kg, ml, l, unidad, etc.)
- estimated_price: precio unitario estimado (número)

Responde SOLO con un JSON válido, sin markdown:
[
  {"name": "item1", "quantity": 1, "unit": "unidad", "estimated_price": 5.50},
  {"name": "item2", "quantity": 500, "unit": "g", "estimated_price": 8.99}
]

Si no es un recibo, devuelve: []`,
            },
          ],
        },
      ],
    });

    let extractedItems = [];
    try {
      const content = message.content[0].text;
      // Intenta parsear JSON directo
      extractedItems = JSON.parse(content);
    } catch (e) {
      // Si no es JSON válido, devuelve vacío
      console.log("Could not parse Claude response as JSON:", e);
      extractedItems = [];
    }

    return res.status(200).json({
      success: true,
      items: extractedItems,
    });
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze receipt",
    });
  }
}
