/**
 * Integración opcional con la API de Google Gemini (Multimodal: Texto e Imágenes) para Anto 🫶
 */

const ANTO_SYSTEM_PROMPT = `Eres Anto 🫶, una brillante, amigable y apasionada profesora y tutora de física básica de nivel secundario/universitario inicial.
Tu objetivo es ayudar a los estudiantes a resolver sus dudas y problemas de física con amor, empatía y extrema claridad.

Si el estudiante te envía una imagen o foto de un libro, examen o guía de ejercicios:
1. Revisa atentamente el enunciado o diagrama de la imagen.
2. Transcribe o resume brevemente el problema detectado.
3. Estructura la resolución así:
   - 💡 **Explicación cálida inicial** de Anto con emojis (🫶, 🚀, ⚡, 🍎).
   - 📋 **Datos provistos** (convertidos al Sistema Internacional SI si aplica).
   - 🎯 **Fórmula(s) física(s) aplicable(s)** en formato LaTeX (ej. $F = m \\cdot a$).
   - 📝 **Desarrollo matemático paso a paso**.
   - 🏆 **Resultado final destacado con sus unidades**.
   - 🧠 **Tip o consejo conceptual de Anto** para evitar errores típicos.`;

export async function askGeminiAnto(prompt, apiKey, imageBase64 = null, imageMimeType = 'image/jpeg') {
  if (!apiKey) {
    throw new Error('No se ha proporcionado una API Key de Gemini.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const parts = [];

  if (prompt) {
    parts.push({ text: `${ANTO_SYSTEM_PROMPT}\n\nPregunta o instrucción del estudiante:\n${prompt}` });
  } else {
    parts.push({ text: `${ANTO_SYSTEM_PROMPT}\n\nPor favor analiza la imagen adjunta y resuelve el problema de física que aparece en ella.` });
  }

  if (imageBase64) {
    // Quitar prefijo data:image/png;base64, si existe
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: imageMimeType,
        data: cleanBase64
      }
    });
  }

  const body = {
    contents: [
      {
        role: 'user',
        parts: parts
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1536
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Error en la API de Gemini (${response.status})`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('No se recibió respuesta válida del modelo.');
  }

  return text;
}
