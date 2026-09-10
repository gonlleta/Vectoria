import React from 'react';
import { Sparkles, Download, FileText, CheckCircle } from 'lucide-react';
import { renderBlockLatex } from '../utils/katexRender';

export default function WhiteboardSheet({ solution, userText }) {
  if (!solution || solution.isConceptual) return null;

  return (
    <div className="whiteboard-sheet-container">
      {/* Encabezado de Hoja de Cuaderno */}
      <div className="sheet-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="#6366f1" />
          <span className="sheet-title">Hoja de Resolución Virtual — Anto 🫶</span>
        </div>
        <span className="sheet-date">{new Date().toLocaleDateString('es-ES')}</span>
      </div>

      {/* Papel en Blanco con Cuadrícula y Línea de Margen */}
      <div className="sheet-paper">
        <div className="margin-line"></div>

        <div className="sheet-content">
          {/* Título del ejercicio en la hoja */}
          <div className="sheet-heading">
            📌 Ejercicio: {solution.title} ({solution.category})
          </div>

          {/* Enunciado traducido en la hoja */}
          {userText && (
            <div className="sheet-enunciado">
              <em>"{userText}"</em>
            </div>
          )}

          {/* Sección 1: Datos y Variables */}
          <div className="sheet-section-title">1. Datos Provistos y Conversión (SI):</div>
          <div className="sheet-datos-list">
            {solution.datos?.map((d, i) => (
              <div key={i} className="sheet-dato-item">
                • <strong>{d.label}:</strong> {d.val}
              </div>
            ))}
          </div>

          {/* Sección 2: Ecuación / Fórmula Aplicada */}
          <div className="sheet-section-title">2. Fórmula Aplicada:</div>
          <div
            className="sheet-formula-box"
            dangerouslySetInnerHTML={{ __html: renderBlockLatex(solution.formula) }}
          />

          {/* Sección 3: Desarrollo Matemático Paso a Paso */}
          <div className="sheet-section-title">3. Desarrollo y Cálculo:</div>
          <div className="sheet-pasos-list">
            {solution.pasos?.map((paso, i) => (
              <div key={i} className="sheet-paso-item">
                <span className="sheet-step-num">Paso {i + 1}:</span> {paso}
              </div>
            ))}
          </div>

          {/* Sección 4: Recuadro del Resultado Final */}
          <div className="sheet-section-title">4. Resultado Final:</div>
          <div className="sheet-result-box">
            <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
              Respuesta {solution.incognita || ''}
            </div>
            <div
              className="sheet-result-math"
              dangerouslySetInnerHTML={{ __html: renderBlockLatex(solution.resultado) }}
            />
            <div className="sheet-stamp">
              <CheckCircle size={16} color="#16a34a" /> Verificado por Anto 🫶
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
