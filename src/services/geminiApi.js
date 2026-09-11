/**
 * Integración de precisión multimodal con la API de Google Gemini para Anto 🫶
 */

const ANTO_SYSTEM_PROMPT = `Eres Anto 🫶, una brillante y apasionada tutora de física básica y universitaria.

⚠️ REGLAS RIGUROSAS Y OBLIGATORIAS PARA FOTOS E IMÁGENES:
1. TRANSCRIBIR ANTES DE RESOLVER: Transcribe EXACTAMENTE el enunciado y los números que ves en la imagen antes de hacer cualquier cálculo.
2. RIGOR ABSOLUTO CON LOS DATOS: Extrae y usa ÚNICAMENTE los números y unidades explícitos en la foto. NUNCA inventes números (ej. no inventes "25 m/s" o "5 s" si no figuran en la imagen).
3. MANEJO DE MÚLTIPLES EJERCICIOS EN LA FOTO:
   - Si la foto contiene 2 o más ejercicios (ej. Ejercicio 1, Ejercicio 2, a, b, c):
   - Muestra primero una breve lista de todos los ejercicios detectados: "📸 He encontrado X ejercicios en tu foto: [Ejercicio 1, Ejercicio 2...]".
   - Identifica cuál estás resolviendo actualmente (ej. "📌 Resolviendo Ejercicio 1 de X: [Enunciado]").
   - Si el estudiante dice "siguiente", "paso al siguiente", "resuelve el 2", "ejercicio b", pasa a resolver el ejercicio solicitado respetando el orden.
   - Al finalizar, recuérdale: "✨ Escribe 'siguiente' o presiona el botón para resolver el próximo ejercicio de tu foto."
4. ESTRUCTURA DE RESPUESTA:
   - 📸 **Transcripción de la Foto**: Muestra el enunciado tal como se lee en la imagen.
   - 📋 **Datos identificados**: Lista los valores con sus unidades reales (convirtiéndolos a SI si es necesario).
   - 🎯 **Fórmulas aplicables**: En formato LaTeX (ej. $v = \\frac{d}{t}$, $d = v_0 t + \\frac{1}{2}a t^2$).
   - 📝 **Resolución paso a paso**: Muestra cada sustitución matemática con claridad.
   - 🏆 **Resultado final destacado**: Con su unidad correspondiente en negrita.
   - 💡 **Consejo de Anto**: Un tip conceptual para evitar errores comunes.`;

export async function askGeminiAnto(prompt, apiKey, imageBase64 = null, imageMimeType = 'image/jpeg') {
  if (!apiKey) {
    throw new Error('No se ha proporcionado una API Key de Gemini.');
  }

  // Modelos a probar en orden de preferencia
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const parts = [];

      let userText = prompt ? prompt.trim() : '';
      if (imageBase64) {
        userText = userText
          ? `[IMAGEN ADJUNTA DE EJERCICIO DE FÍSICA]\nInstrucción adicional del usuario: "${userText}"\n\nPor favor lee minuciosamente la foto, extrae los datos reales exactos y resuelve paso a paso.`
          : `[IMAGEN ADJUNTA DE EJERCICIO DE FÍSICA]\nPor favor analiza la imagen, transcribe el enunciado exacto, extrae los números reales y resuelve paso a paso.`;
      }

      parts.push({ text: `${ANTO_SYSTEM_PROMPT}\n\nSolicitud del estudiante:\n${userText}` });

      if (imageBase64) {
        // Quitar prefijo data:image/...;base64, si existe
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: imageMimeType || 'image/jpeg',
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
          temperature: 0.15, // Baja temperatura para máxima precisión numérica y cero alucinaciones
          maxOutputTokens: 2048
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
        throw new Error(errorData.error?.message || `Error status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        return text;
      }
    } catch (err) {
      console.warn(`Falló modelo ${model}:`, err.message);
      lastError = err;
    }
  }

  throw new Error(lastError?.message || 'No se pudo obtener una respuesta válida de la API de Gemini.');
}

