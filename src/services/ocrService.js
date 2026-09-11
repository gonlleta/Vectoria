import { createWorker } from 'tesseract.js';

/**
 * Rotar una imagen en DataURL por un número de grados (90, 180, 270)
 */
function rotateImageDataUrl(dataUrl, degrees) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Procesa una imagen en base64 y extrae el texto usando Tesseract.js
 * Incluye auto-rotación (90° / 270°) si la foto está de costado.
 */
export async function scanImageText(imageSrc, onProgress) {
  try {
    const worker = await createWorker('spa+eng');
    
    if (onProgress) {
      onProgress('Escaneando texto de la foto...');
    }

    // 1. Escaneo inicial en orientación original
    let ret = await worker.recognize(imageSrc);
    let rawText = ret.data.text || '';
    
    // Contar si encontramos números en la orientación original
    const hasNumbers = /\d+/.test(rawText);

    // 2. Si la orientación original dió poco resultado (foto de costado), probar rotación 90° y 270°
    if (!hasNumbers || rawText.trim().length < 15) {
      if (onProgress) onProgress('Auto-rotando imagen para leer texto de costado...');
      
      const rotated270 = await rotateImageDataUrl(imageSrc, 270);
      const ret270 = await worker.recognize(rotated270);
      const text270 = ret270.data.text || '';

      if (text270.trim().length > rawText.trim().length) {
        rawText = text270;
      } else {
        const rotated90 = await rotateImageDataUrl(imageSrc, 90);
        const ret90 = await worker.recognize(rotated90);
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

