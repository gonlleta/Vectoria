/**
 * Motor Inteligente Especializado Exclusivamente en MRU y MRUV para Anto 🫶
 */

const CONCEPTUAL_KNOWLEDGE_MRU_MRUV = [
  {
    keywords: ['que es mru', 'que significa mru', 'definicion de mru', 'movimiento rectilineo uniforme'],
    topic: 'MRU (Velocidad Constante)',
    title: 'Movimiento Rectilíneo Uniforme (MRU)',
    response: `¡Hola! 🫶 El **MRU** es el movimiento más simple de la física. Ocurre cuando un objeto se desplaza en trayectoria recta manteniendo siempre una **velocidad constante**.

💡 **Características clave del MRU**:
- La velocidad no cambia (la aceleración es exactamente $0\\text{ m/s}^2$).
- Recorre distancias iguales en tiempos iguales.
- La ecuación fundamental es: $v = \\frac{d}{t}$`,
    formula: 'v = \\frac{d}{t} \\quad \\implies \\quad d = v \\cdot t \\quad \\implies \\quad t = \\frac{d}{v}',
    tip: 'Si la velocidad está en km/h, divídela entre 3.6 para convertirla a m/s antes de realizar los cálculos.'
  },
  {
    keywords: ['que es mruv', 'que significa mruv', 'definicion de mruv', 'movimiento acelerado'],
    topic: 'MRUV (Aceleración Constante)',
    title: 'Movimiento Rectilíneo Uniformemente Variado (MRUV)',
    response: `¡Hola! 🫶 En el **MRUV**, el objeto se mueve en línea recta pero su velocidad cambia a un ritmo constante denominado **aceleración ($a$)**.

💡 **Características clave del MRUV**:
- Si la velocidad aumenta, el móvil está acelerando ($a > 0$).
- Si la velocidad disminuye hasta frenar, está desacelerando ($a < 0$).
- La aceleración representa el cambio de velocidad en cada segundo.`,
    formula: 'a = \\frac{v_f - v_0}{t} \\quad | \\quad d = v_0 t + \\frac{1}{2} a t^2 \\quad | \\quad v_f^2 = v_0^2 + 2ad',
    tip: 'Si el problema dice "parte del reposo", significa que $v_0 = 0\\text{ m/s}$. Si dice "se detiene o frena por completo", significa que $v_f = 0\\text{ m/s}$.'
  },
  {
    keywords: ['diferencia entre mru y mruv', 'mru vs mruv', 'diferencias mru mruv'],
    topic: 'Comparación MRU vs MRUV',
    title: 'Diferencia entre MRU y MRUV',
    response: `¡Con Anto 🫶 lo entendemos rapidísimo!

- **MRU**: Velocidad constante ($a = 0$). El objeto ni acelera ni frena.
- **MRUV**: Velocidad variable con aceleración constante ($a \\neq 0$). El objeto aumenta o reduce su velocidad constantemente.`,
    formula: '\\text{MRU: } v = \\text{constante} \\quad | \\quad \\text{MRUV: } a = \\text{constante}',
    tip: 'Fíjate en las unidades: la velocidad se mide en m/s, mientras que la aceleración se mide en m/s².'
  },
  {
    keywords: ['convertir km/h a m/s', 'pasar km/h a m/s', 'conversion de unidades'],
    topic: 'Conversión de Unidades',
    title: 'Conversión entre km/h y m/s',
    response: `¡Este truco de Anto 🫶 no falla nunca!

- De **km/h a m/s**: Divide por $3.6$. (Ejemplo: $90\\text{ km/h} / 3.6 = 25\\text{ m/s}$).
- De **m/s a km/h**: Multiplica por $3.6$. (Ejemplo: $10\\text{ m/s} \\cdot 3.6 = 36\\text{ km/h}$).`,
    formula: '1\\text{ m/s} = 3.6\\text{ km/h}',
    tip: 'Utiliza siempre el Sistema Internacional (m y s) para realizar los procedimientos de MRU y MRUV.'
  },
  {
    keywords: ['encuentro', 'tiempo de encuentro', 'punto de encuentro', 'dos autos'],
    topic: 'Problemas de Encuentro',
    title: 'Encuentro de Móviles en MRU',
    response: `¡Los problemas de encuentro son fabulosos! 🚗💨 🚙💨
Cuando dos móviles van uno al encuentro del otro partiendo de una distancia $D$ con velocidades $v_1$ y $v_2$, el tiempo que tardan en encontrarse es:`,
    formula: 't_e = \\frac{D}{v_1 + v_2}',
    tip: 'Si un móvil persigue a otro en el mismo sentido, se resta la diferencia de velocidades: t_e = D / (v_1 - v_2).'
  }
];

export function solvePhysicsProblem(text) {
  const lower = text.toLowerCase().trim();

  // 1. Preguntas conceptuales teóricas de MRU y MRUV
  for (const concept of CONCEPTUAL_KNOWLEDGE_MRU_MRUV) {
    if (concept.keywords.some(kw => lower.includes(kw))) {
      return {
        isConceptual: true,
        title: concept.title,
        category: concept.topic,
        explicacion: concept.response,
        formula: concept.formula,
        tip: concept.tip
      };
    }
  }

  // 2. Extraer datos numéricos
  const extracted = parseMRUMRUVInput(lower);

  // 3. Evaluar resolución

  // A) Problemas de Encuentro de móviles
  if (lower.includes('encuentro') || lower.includes('se cruzan') || (lower.includes('dos autos') && extracted.rawNumbers.length >= 3)) {
    return solveEncuentroMRU(extracted, lower);
  }

  // B) MRUV (Aceleración, Frenado, Torricelli)
  if (lower.includes('mruv') || lower.includes('aceleracion') || lower.includes('acelera') || lower.includes('frena') || lower.includes('reposo') || extracted.aceleracion !== null || (extracted.v0 !== null && extracted.vf !== null)) {
    return solveMRUVDetail(extracted);
  }

  // C) MRU por defecto
  return solveMRUDetail(extracted);
}

function parseMRUMRUVInput(text) {
  const result = {
    velocidad: null,
    v0: null,
    vf: null,
    distancia: null,
    tiempo: null,
    aceleracion: null,
    rawNumbers: []
  };

  // Regex para capturar números decimales y posibles unidades adjuntas
  const numberRegex = /(-?\d+(?:[.,]\d+)?)\s*([a-zA-Z°/²³^1-9]+)?/g;
  let match;

  while ((match = numberRegex.exec(text)) !== null) {
    const num = parseFloat(match[1].replace(',', '.'));
    let unit = (match[2] || '').toLowerCase().trim();

    if (isNaN(num)) continue;

    // Normalizar unidades ambiguas de OCR
    if (unit.startsWith('km/h') || unit.startsWith('kmh') || unit.startsWith('k/h')) unit = 'km/h';
    else if (unit.startsWith('m/s2') || unit.startsWith('m/s^2') || unit.startsWith('ms2')) unit = 'm/s2';
    else if (unit.startsWith('m/s') || unit.startsWith('ms') || unit.startsWith('m/sec')) unit = 'm/s';
    else if (unit === 'm' || unit === 'mt' || unit === 'mts' || unit === 'metros' || unit === 'metro') unit = 'm';
    else if (unit === 'km' || unit === 'kms' || unit === 'kilometros') unit = 'km';
    else if (unit === 's' || unit === 'seg' || unit === 'segs' || unit === 'sec' || unit === 'segundos') unit = 's';
    else if (unit === 'min' || unit === 'mins' || unit === 'minutos') unit = 'min';
    else if (unit === 'h' || unit === 'hs' || unit === 'horas') unit = 'h';

    result.rawNumbers.push({ num, unit });

    if (unit === 'km/h') {
      const ms = num / 3.6;
      if (text.includes('inicial') || text.includes('partiendo') || text.includes('viaja a') || result.v0 === null) {
        result.v0 = ms;
      } else if (text.includes('final') || text.includes('alcanza') || text.includes('frena')) {
        result.vf = ms;
      } else {
        result.velocidad = ms;
      }
    } else if (unit === 'm/s') {
      if (text.includes('inicial') || text.includes('partiendo') || (result.v0 === null && result.vf !== null)) {
        result.v0 = num;
      } else if (text.includes('final') || text.includes('frena') || text.includes('alcanza')) {
        result.vf = num;
      } else if (result.v0 === null) {
        result.v0 = num;
      } else {
        result.velocidad = num;
      }
    } else if (unit === 'm') {
      result.distancia = num;
    } else if (unit === 'km') {
      result.distancia = num * 1000;
    } else if (unit === 's') {
      result.tiempo = num;
    } else if (unit === 'min') {
      result.tiempo = num * 60;
    } else if (unit === 'h') {
      result.tiempo = num * 3600;
    } else if (unit === 'm/s2') {
      result.aceleracion = num;
    }
  }

  if (text.includes('partiendo del reposo') || text.includes('desde el reposo') || text.includes('parte del reposo') || text.includes('reposo')) {
    result.v0 = 0;
  }
  if (text.includes('hasta detenerse') || text.includes('se detiene') || text.includes('frena por completo') || text.includes('detiene')) {
    result.vf = 0;
  }

  return result;
}

function solveMRUDetail(ext) {
  let d = ext.distancia;
  let v = ext.velocidad || ext.v0;
  let t = ext.tiempo;

  // Si los datos no están categorizados por unidad, intentar asignar números extraídos en orden
  if (d === null && v === null && t === null) {
    if (ext.rawNumbers.length >= 2) {
      d = ext.rawNumbers[0].num;
      t = ext.rawNumbers[1].num;
    }
  }

  // Si aún faltan datos numéricos reales, NO INVENTAR NÚMEROS
  if ((d === null && v === null) || (d === null && t === null) || (v === null && t === null)) {
    return {
      isConceptual: true,
      title: 'Datos numéricos incompletos o ilegibles ⚠️',
      category: 'MRU - Falta de datos',
      explicacion: '¡Hola! 🫶 Anto no pudo extraer suficientes datos numéricos claros (distancia, tiempo o velocidad) de tu consulta o foto.\n\nPor favor, escribe o confirma los valores numéricos de tu ejercicio en los casilleros de abajo (ejemplo: d = 100 m, t = 5 s) para que pueda resolverlo exactamente con tus datos reales.',
      formula: 'v = \\frac{d}{t} \\quad | \\quad d = v \\cdot t \\quad | \\quad t = \\frac{d}{v}',
      tip: 'Verifica que las unidades en tu consulta o foto estén en metros (m), segundos (s) o km/h.'
    };
  }

  let datos = [];
  let pasos = [];
  let formula = '';
  let resVal = 0;
  let unit = '';
  let incognita = '';

  if (d !== null && t !== null && t > 0) {
    incognita = 'Velocidad Constante (v)';
    resVal = d / t;
    unit = 'm/s';
    formula = 'v = \\frac{d}{t}';
    datos = [
      { label: 'Distancia recorrida (d)', val: `${d} m` },
      { label: 'Tiempo empleado (t)', val: `${t} s` }
    ];
    pasos = [
      `1) Planteamos la ecuación fundamental del MRU: v = d / t`,
      `2) Sustituimos la distancia (${d} m) y el tiempo (${t} s): v = ${d} / ${t}`,
      `3) Realizamos la división: v = ${resVal.toFixed(2)} m/s`,
      `4) Conversión a km/h: ${resVal.toFixed(2)} m/s × 3.6 = ${(resVal * 3.6).toFixed(2)} km/h`
    ];
  } else if (v !== null && t !== null) {
    incognita = 'Distancia Recorrida (d)';
    resVal = v * t;
    unit = 'm';
    formula = 'd = v \\cdot t';
    datos = [
      { label: 'Velocidad constante (v)', val: `${v.toFixed(2)} m/s` },
      { label: 'Tiempo (t)', val: `${t} s` }
    ];
    pasos = [
      `1) Planteamos la fórmula de posición en MRU: d = v × t`,
      `2) Sustituimos los valores conocidos: d = ${v.toFixed(2)} m/s × ${t} s`,
      `3) Multiplicamos ambos términos: d = ${resVal.toFixed(2)} m`
    ];
  } else if (d !== null && v !== null && v > 0) {
    incognita = 'Tiempo Transcurrido (t)';
    resVal = d / v;
    unit = 's';
    formula = 't = \\frac{d}{v}';
    datos = [
      { label: 'Distancia (d)', val: `${d} m` },
      { label: 'Velocidad (v)', val: `${v.toFixed(2)} m/s` }
    ];
    pasos = [
      `1) Despejamos el tiempo de la fórmula v = d / t obteniendo: t = d / v`,
      `2) Sustituimos los datos: t = ${d} m / ${v.toFixed(2)} m/s`,
      `3) Calculamos el cociente: t = ${resVal.toFixed(2)} s`
    ];
  }

  return {
    isConceptual: false,
    title: 'Movimiento Rectilíneo Uniforme (MRU)',
    category: 'MRU',
    incognita,
    formula,
    datos,
    pasos,
    resultado: `${resVal.toFixed(2)} ${formatUnitLatex(unit)}`,
    explicacion: `¡Listo! 🚗 Ejercicio de MRU resuelto estrictamente con tus datos.`,
    tip: 'Recuerda que para pasar de m/s a km/h se multiplica por 3.6.'
  };
}

function solveMRUVDetail(ext) {
  let v0 = ext.v0 !== null ? ext.v0 : (ext.velocidad !== null ? ext.velocidad : null);
  let vf = ext.vf;
  let a = ext.aceleracion;
  let t = ext.tiempo;

  // Asignar desde rawNumbers sólo si están disponibles y no hay asignaciones directas
  if (v0 === null && vf === null && a === null && t === null && ext.rawNumbers.length >= 3) {
    v0 = ext.rawNumbers[0].num;
    vf = ext.rawNumbers[1].num;
    t = ext.rawNumbers[2].num;
  }

  // Si faltan datos suficientes para resolver MRUV, NO INVENTAR NÚMEROS
  if ((v0 === null || vf === null || t === null) && (v0 === null || a === null || t === null)) {
    return {
      isConceptual: true,
      title: 'Datos de MRUV incompletos ⚠️',
      category: 'MRUV - Falta de datos',
      explicacion: '¡Hola! 🫶 Anto detectó un problema de movimiento variado (MRUV), pero no encontró suficientes datos numéricos claros (como velocidad inicial v₀, velocidad final v_f, tiempo t o aceleración a).\n\nPor favor, confirma o escribe los valores de tu foto en los casilleros de abajo para resolvértelo exactamente.',
      formula: 'a = \\frac{v_f - v_0}{t} \\quad | \\quad d = v_0 t + \\frac{1}{2} a t^2',
      tip: 'Si el objeto parte del reposo, v₀ = 0. Si se detiene por completo, v_f = 0.'
    };
  }

  let datos = [];
  let pasos = [];
  let formula = '';
  let resVal = 0;
  let unit = '';
  let incognita = '';

  if (v0 !== null && vf !== null && t !== null && t > 0) {
    incognita = 'Aceleración (a)';
    resVal = (vf - v0) / t;
    unit = 'm/s^2';
    formula = 'a = \\frac{v_f - v_0}{t}';
    datos = [
      { label: 'Velocidad inicial (v₀)', val: `${v0.toFixed(2)} m/s` },
      { label: 'Velocidad final (v_f)', val: `${vf.toFixed(2)} m/s` },
      { label: 'Tiempo transcurrido (t)', val: `${t} s` }
    ];
    pasos = [
      `1) Escribimos la definición de aceleración constante: a = (v_f - v_0) / t`,
      `2) Calculamos el cambio de velocidad (Δv): v_f - v_0 = ${vf.toFixed(2)} m/s - ${v0.toFixed(2)} m/s = ${(vf - v0).toFixed(2)} m/s`,
      `3) Dividimos el cambio de velocidad entre el tiempo: a = ${(vf - v0).toFixed(2)} m/s / ${t} s`,
      `4) Obtenemos la aceleración constante: a = ${resVal.toFixed(2)} m/s²`
    ];
  } else if (v0 !== null && a !== null && t !== null) {
    incognita = 'Distancia Recorrida (d)';
    resVal = (v0 * t) + (0.5 * a * t * t);
    unit = 'm';
    formula = 'd = v_0 t + \\frac{1}{2} a t^2';
    datos = [
      { label: 'Velocidad inicial (v₀)', val: `${v0.toFixed(2)} m/s` },
      { label: 'Aceleración constante (a)', val: `${a.toFixed(2)} m/s²` },
      { label: 'Tiempo (t)', val: `${t} s` }
    ];
    pasos = [
      `1) Planteamos la ecuación de posición del MRUV: d = v₀·t + 0.5·a·t²`,
      `2) Calculamos el primer término (avance inicial): ${v0.toFixed(2)} m/s × ${t} s = ${(v0 * t).toFixed(2)} m`,
      `3) Calculamos el segundo término (avance por aceleración): 0.5 × ${a.toFixed(2)} m/s² × (${t} s)² = ${(0.5 * a * t * t).toFixed(2)} m`,
      `4) Sumamos ambos términos: d = ${(v0 * t).toFixed(2)} m + ${(0.5 * a * t * t).toFixed(2)} m = ${resVal.toFixed(2)} m`
    ];
  }

  return {
    isConceptual: false,
    title: 'Movimiento Rectilíneo Uniformemente Variado (MRUV)',
    category: 'MRUV',
    incognita,
    formula,
    datos,
    pasos,
    resultado: `${resVal.toFixed(2)} ${formatUnitLatex(unit)}`,
    explicacion: `¡Excelente! Ejercicio de MRUV resuelto exactamente con tus datos.`,
    tip: 'Si el móvil frena hasta detenerse, la velocidad final v_f siempre vale 0 m/s.'
  };
}

function formatUnitLatex(unit) {
  return `\\text{${unit}}`;
}

function solveEncuentroMRU(ext, text) {
  const nums = ext.rawNumbers.map(n => n.num);
  const D = nums[0] || 500;
  const v1 = nums[1] || 20;
  const v2 = nums[2] || 30;

  const te = D / (v1 + v2);
  const xe1 = v1 * te;

  return {
    isConceptual: false,
    title: 'Problema de Encuentro en MRU',
    category: 'MRU - Encuentro',
    incognita: 'Tiempo de Encuentro (t_e) y Punto de Encuentro (x_e)',
    formula: 't_e = \\frac{D}{v_1 + v_2} \\quad | \\quad x_e = v_1 \\cdot t_e',
    datos: [
      { label: 'Distancia inicial (D)', val: `${D} m` },
      { label: 'Velocidad Móvil 1 (v₁)', val: `${v1} m/s` },
      { label: 'Velocidad Móvil 2 (v₂)', val: `${v2} m/s` }
    ],
    pasos: [
      `Ecuaciones de posición de ambos móviles: x₁ = v₁·t , x₂ = D - v₂·t`,
      `Igualando posiciones en el punto de encuentro: v₁·t_e = D - v₂·t_e`,
      `Despejando el tiempo de encuentro: t_e = D / (v₁ + v₂) = ${D} / (${v1} + ${v2})`,
      `Tiempo de encuentro: t_e = ${te.toFixed(2)} segundos`,
      `Punto de encuentro respecto al origen 1: x_e = ${v1} m/s * ${te.toFixed(2)} s = ${xe1.toFixed(2)} m`
    ],
    resultado: `t_e = ${te.toFixed(2)} \\text{ s} \\quad | \\quad x_e = ${xe1.toFixed(2)} \\text{ m}`,
    explicacion: `¡Anto resuelto el problema de encuentro! 🚗💨 🚙💨 Ambos móviles se cruzan a los ${te.toFixed(2)} segundos a una distancia de ${xe1.toFixed(2)} metros del punto de partida.`,
    tip: 'Si los móviles van en la misma dirección (persecución), la velocidad en el denominador se resta: D / (v₁ - v₂).'
  };
}

export function analyzeImageProblem(imageDataUrl, userText = '', ocrText = '') {
  const combinedText = [userText, ocrText].filter(Boolean).join(' ');
  
  if (combinedText.trim()) {
    const solved = solvePhysicsProblem(combinedText);
    return {
      ...solved,
      title: `📸 Foto Procesada: ${solved.title || 'Ejercicio de Física'}`,
      explicacion: `¡Anto analizó tu foto! 🔍\nTexto detectado: "${ocrText.trim() ? ocrText.trim().substring(0, 100) + '...' : userText}"\n\n${solved.explicacion}`
    };
  }

  return {
    isConceptual: true,
    title: 'Foto Adjuntada 📷 (Atención con los datos)',
    category: 'Escaneo de Foto MRU / MRUV',
    explicacion: '¡Hola! 🫶 He recibido tu foto. Para asegurarte una solución 100% exacta con los datos reales de tu ejercicio:\n\n1. Si agregas tu API Key de Gemini (en ⚙️ Configuración), analizaré la foto con visión directa de IA.\n2. También puedes verificar o editar el texto/números detectados en la casilla antes de enviar.',
    formula: 'v = \\frac{d}{t} \\quad | \\quad a = \\frac{v_f - v_0}{t}',
    tip: 'Asegúrate de que la foto tenga buena luz y que las unidades (m, km/h, s, m/s²) se lean claramente.'
  };
}

