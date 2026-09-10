import React from 'react';
import { FileText, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { renderBlockLatex, renderLatex } from '../utils/katexRender';

export default function WhiteboardSheet({ solution, userText }) {
  if (!solution || solution.isConceptual) return null;

  return (
    <div className="whiteboard-sheet-container">
      {/* Encabezado del Cuaderno */}
      <div className="sheet-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="#818cf8" />
          <span className="sheet-title">Hoja de Resolución Meticulosa — Anto 🫶</span>
        </div>
        <span className="sheet-date">{new Date().toLocaleDateString('es-ES')}</span>
      </div>

      {/* Papel de Cuaderno Cuadriculado con Línea de Margen */}
      <div className="sheet-paper">
        <div className="margin-line"></div>

        <div className="sheet-content">
          {/* Título del Ejercicio */}
          <div className="sheet-heading">
            📌 Ejercicio: {solution.title}
          </div>

          {/* Enunciado traducido */}
          {userText && (
            <div className="sheet-enunciado">
              <strong>Enunciado:</strong> <em>"{userText}"</em>
            </div>
          )}

          {/* PASO 1: Identificación de Datos y Conversión */}
          <div className="sheet-section-title">
            <span className="sheet-badge">PASO 1</span> Identificación de Datos Provistos (Sistema Internacional)
          </div>
          <div className="sheet-datos-grid">
            {solution.datos?.map((d, i) => (
              <div key={i} className="sheet-dato-card">
                <span className="lbl">{d.label}:</span>
                <span className="val">{d.val}</span>
              </div>
            ))}
          </div>

          {/* PASO 2: Selección de Fórmula */}
          <div className="sheet-section-title" style={{ marginTop: '1.1rem' }}>
            <span className="sheet-badge">PASO 2</span> Ecuación Físicamente Aplicable
          </div>
          <div
            className="sheet-formula-box"
            dangerouslySetInnerHTML={{ __html: renderBlockLatex(solution.formula) }}
          />

          {/* PASO 3: Sustitución y Procedimiento Matemático Detallado */}
          <div className="sheet-section-title">
            <span className="sheet-badge">PASO 3</span> Procedimiento y Cálculo Paso a Paso
          </div>
          <div className="sheet-pasos-list">
            {solution.pasos?.map((paso, i) => (
              <div key={i} className="sheet-paso-item">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span className="sheet-step-pill">{i + 1}</span>
                  <div style={{ flex: 1 }}>{paso}</div>
                </div>
              </div>
            ))}
          </div>

          {/* PASO 4: Resultado Final Destacado con Recuadro Doble */}
          <div className="sheet-section-title" style={{ marginTop: '1.25rem' }}>
            <span className="sheet-badge">PASO 4</span> Resultado Final Obtenido
          </div>
          <div className="sheet-result-box">
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
              Respuesta Incógnita: {solution.incognita || 'Valor Calculado'}
            </div>
            <div
              className="sheet-result-math"
              dangerouslySetInnerHTML={{ __html: renderBlockLatex(solution.resultado) }}
            />
            <div className="sheet-stamp">
              <CheckCircle2 size={16} color="#16a34a" /> Verificado por Anto 🫶
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
