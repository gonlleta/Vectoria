import { createWorker } from 'tesseract.js';

/**
 * Pre-procesar, escalar (max 1400px) y rotar imagen en HTML5 Canvas para máximo rendimiento OCR
 */
function preprocessImageForOcr(dataUrl, degrees = 0) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let targetW = img.width;
      let targetH = img.height;
      const MAX_DIM = 1400;

      if (targetW > MAX_DIM || targetH > MAX_DIM) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * MAX_DIM) / targetW);
          targetW = MAX_DIM;
        } else {
          targetW = Math.round((targetW * MAX_DIM) / targetH);
          targetH = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (degrees === 90 || degrees === 270) {
        canvas.width = targetH;
        canvas.height = targetW;
      } else {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);

      resolve(canvas.toDataURL('image/jpeg', 0.90));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Procesa una imagen en base64 y extrae el texto usando Tesseract.js
 */
export async function scanImageText(imageSrc, onProgress) {
  try {
    const worker = await createWorker('spa+eng');
    
    if (onProgress) {
      onProgress('Escaneando texto de la foto...');
    }

    // 1. Escaneo inicial con la foto preprocesada
    const prepOriginal = await preprocessImageForOcr(imageSrc, 0);
    let ret = await worker.recognize(prepOriginal);
    let rawText = ret.data.text || '';
    
    // Contar si encontramos números y palabras de física en la orientación original
    const hasNumbers = /\d+/.test(rawText);

    // 2. Si la foto está de costado (ej. 270° o 90°), probar versiones rotadas
    if (!hasNumbers || rawText.trim().length < 20) {
      if (onProgress) onProgress('Probando rotación de imagen (270°)...');
      const prep270 = await preprocessImageForOcr(imageSrc, 270);
      const ret270 = await worker.recognize(prep270);
      const text270 = ret270.data.text || '';

      if (/\d+/.test(text270) || text270.trim().length > rawText.trim().length) {
        rawText = text270;
      } else {
        if (onProgress) onProgress('Probando rotación de imagen (90°)...');
        const prep90 = await preprocessImageForOcr(imageSrc, 90);
        const ret90 = await worker.recognize(prep90);
        const text90 = ret90.data.text || '';
        if (text90.trim().length > rawText.trim().length) {
          rawText = text90;
        }
      }
    }

    await worker.terminate();

    const cleanedText = rawText
      .replace(/\s+/g, ' ')
      .trim();

    return cleanedText;
  } catch (error) {
    console.error('Error en escaneo OCR Tesseract:', error);
    return '';
  }
}


