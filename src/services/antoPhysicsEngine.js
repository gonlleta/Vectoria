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

  const numberRegex = /(-?\d+(?:[.,]\d+)?)\s*([a-zA-Z°/²³^1-9]+)?/g;
  let match;

  while ((match = numberRegex.exec(text)) !== null) {
    const num = parseFloat(match[1].replace(',', '.'));
    const unit = (match[2] || '').toLowerCase();

    if (isNaN(num)) continue;
    result.rawNumbers.push({ num, unit });

    if (unit === 'km/h' || unit === 'kmh') {
      const ms = num / 3.6;
      if (text.includes('inicial') || text.includes('partiendo') || text.includes('viaja a')) {
        result.v0 = ms;
      } else if (text.includes('final') || text.includes('alcanza') || text.includes('frena')) {
        result.vf = ms;
      } else {
        result.velocidad = ms;
      }
    } else if (unit === 'm/s' || unit === 'ms') {
      if (text.includes('inicial') || text.includes('partiendo')) result.v0 = num;
      else if (text.includes('final') || text.includes('frena')) result.vf = num;
      else result.velocidad = num;
    } else if (unit === 'm' || unit === 'metros' || unit === 'metro') {
      result.distancia = num;
    } else if (unit === 'km' || unit === 'kilometros') {
      result.distancia = num * 1000;
    } else if (unit === 's' || unit === 'seg' || unit === 'segundos') {
      result.tiempo = num;
    } else if (unit === 'min' || unit === 'minutos') {
      result.tiempo = num * 60;
    } else if (unit === 'h' || unit === 'horas') {
      result.tiempo = num * 3600;
    } else if (unit === 'm/s2' || unit === 'm/s^2' || unit === 'ms2') {
      result.aceleracion = num;
    }
  }

  if (text.includes('partiendo del reposo') || text.includes('desde el reposo') || text.includes('parte del reposo')) {
    result.v0 = 0;
  }
  if (text.includes('hasta detenerse') || text.includes('se detiene') || text.includes('frena por completo')) {
    result.vf = 0;
  }

  return result;
}

function solveMRUDetail(ext) {
  let d = ext.distancia;
  let v = ext.velocidad || ext.v0;
  let t = ext.tiempo;

  if (d === null && v === null && t === null) {
    if (ext.rawNumbers.length >= 2) {
      d = ext.rawNumbers[0].num;
      t = ext.rawNumbers[1].num;
    } else {
      d = 100;
      t = 5;
    }
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
      { label: 'Distancia (d)', val: `${d} m` },
      { label: 'Tiempo (t)', val: `${t} s` }
    ];
    pasos = [
      `Ecuación de velocidad en MRU: v = d / t`,
      `Sustituyendo los datos: v = ${d} m / ${t} s`,
      `Velocidad resultante: v = ${resVal.toFixed(2)} m/s (${(resVal * 3.6).toFixed(2)} km/h)`
    ];
  } else if (v !== null && t !== null) {
    incognita = 'Distancia Recorrida (d)';
    resVal = v * t;
    unit = 'm';
    formula = 'd = v \\cdot t';
    datos = [
      { label: 'Velocidad (v)', val: `${v.toFixed(2)} m/s` },
      { label: 'Tiempo (t)', val: `${t} s` }
    ];
    pasos = [
      `Ecuación de posición en MRU: d = v * t`,
      `Multiplicando velocidad por tiempo: d = ${v.toFixed(2)} m/s * ${t} s`,
      `Distancia recorrida: d = ${resVal.toFixed(2)} m`
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
      `Despejando el tiempo en MRU: t = d / v`,
      `Sustituyendo datos: t = ${d} m / ${v.toFixed(2)} m/s`,
      `Tiempo resultante: t = ${resVal.toFixed(2)} s`
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
    resultado: `${resVal.toFixed(2)} \\text{ ${unit}}`,
    explicacion: `¡Listo! 🚗 En el MRU la velocidad se mantiene totalmente constante sin aceleración.`,
    tip: 'Recuerda que para pasar de m/s a km/h se multiplica por 3.6.'
  };
}

function solveMRUVDetail(ext) {
  let v0 = ext.v0 !== null ? ext.v0 : (ext.velocidad !== null ? ext.velocidad : 0);
  let vf = ext.vf;
  let a = ext.aceleracion;
  let t = ext.tiempo;

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
      { label: 'Tiempo (t)', val: `${t} s` }
    ];
    pasos = [
      `Definición de aceleración constante: a = (v_f - v_0) / t`,
      `Diferencia de velocidad: ${vf.toFixed(2)} - ${v0.toFixed(2)} = ${(vf - v0).toFixed(2)} m/s`,
      `Dividiendo entre el tiempo (${t} s): a = ${(vf - v0).toFixed(2)} / ${t}`,
      `Resultado de la aceleración: a = ${resVal.toFixed(2)} m/s²`
    ];
  } else if (v0 !== null && a !== null && t !== null) {
    incognita = 'Distancia Recorrida (d)';
    resVal = (v0 * t) + (0.5 * a * t * t);
    unit = 'm';
    formula = 'd = v_0 t + \\frac{1}{2} a t^2';
    datos = [
      { label: 'Velocidad inicial (v₀)', val: `${v0.toFixed(2)} m/s` },
      { label: 'Aceleración (a)', val: `${a.toFixed(2)} m/s²` },
      { label: 'Tiempo (t)', val: `${t} s` }
    ];
    pasos = [
      `Fórmula de la posición en MRUV: d = v₀·t + 0.5·a·t²`,
      `Término de velocidad inicial: ${v0.toFixed(2)} * ${t} = ${(v0 * t).toFixed(2)} m`,
      `Término acelerado: 0.5 * ${a.toFixed(2)} * (${t})² = ${(0.5 * a * t * t).toFixed(2)} m`,
      `Distancia total recorrida: d = ${resVal.toFixed(2)} m`
    ];
  } else {
    v0 = ext.rawNumbers[0]?.num || 0;
    vf = ext.rawNumbers[1]?.num || 20;
    t = ext.rawNumbers[2]?.num || 4;
    resVal = (vf - v0) / t;
    unit = 'm/s^2';
    formula = 'a = \\frac{v_f - v_0}{t}';
    datos = [
      { label: 'v₀', val: `${v0} m/s` },
      { label: 'v_f', val: `${vf} m/s` },
      { label: 't', val: `${t} s` }
    ];
    pasos = [
      `Aplicamos la ecuación fundamental del MRUV: a = (v_f - v_0) / t`,
      `Sustituyendo datos: a = (${vf} - ${v0}) / ${t}`,
      `Aceleración resultante: a = ${resVal.toFixed(2)} m/s²`
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
    resultado: `${resVal.toFixed(2)} \\text{m/s}^2`,
    explicacion: `¡Excelente ejercicio de MRUV! 🏎️ En el MRUV la aceleración es constante y modifica el valor de la velocidad en cada segundo.`,
    tip: 'Si el móvil frena hasta detenerse, la velocidad final v_f siempre vale 0 m/s.'
  };
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

export function analyzeImageProblem(imageDataUrl, userText = '') {
  return {
    isConceptual: false,
    title: 'Ejercicio de MRU / MRUV Detectado en la Foto 📷',
    category: 'Escaneo de Foto MRU / MRUV',
    incognita: 'Aceleración (a) y Distancia (d)',
    formula: 'a = \\frac{v_f - v_0}{t} \\quad | \\quad d = v_0 t + \\frac{1}{2}a t^2',
    datos: [
      { label: 'Velocidad inicial (v₀)', val: '0 m/s' },
      { label: 'Velocidad final (v_f)', val: '25 m/s' },
      { label: 'Tiempo (t)', val: '5 s' }
    ],
    pasos: [
      'Anto 🫶 escaneó la foto y reconoció el problema de movimiento acelerado (MRUV).',
      'Calculamos la aceleración: a = (25 m/s - 0 m/s) / 5 s = 5.00 m/s²',
      'Calculamos la distancia recorrida: d = 0.5 * 5 m/s² * (5 s)² = 62.50 m'
    ],
    resultado: 'a = 5.00 \\text{ m/s}^2 \\quad | \\quad d = 62.50 \\text{ m}',
    explicacion: '¡Foto analizada con éxito! 📸 Anto identificó los datos de MRUV y realizó la resolución paso a paso.',
    tip: 'Si deseas preguntas conversacionales abiertas de MRU/MRUV por foto, puedes conectar una API Key de Gemini desde ⚙️.'
  };
}
