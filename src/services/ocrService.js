import { createWorker } from 'tesseract.js';

/**
 * Procesa una imagen en base64 / blob URL y extrae el texto usando Tesseract.js (Español / Inglés)
 */
export async function scanImageText(imageSrc, onProgress) {
  try {
    const worker = await createWorker('spa+eng');
    
    if (onProgress) {
      onProgress('Escaneando texto de la foto...');
    }

    const ret = await worker.recognize(imageSrc);
    await worker.terminate();

    const rawText = ret.data.text || '';
    
    // Limpieza básica manteniéndo números, letras y unidades
    const cleanedText = rawText
      .replace(/\s+/g, ' ')
      .trim();

    return cleanedText;
  } catch (error) {
    console.error('Error en escaneo OCR Tesseract:', error);
    return '';
  }
}
