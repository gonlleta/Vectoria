import React, { useState } from 'react';
import { Calculator, ArrowRight, Send } from 'lucide-react';
import { renderBlockLatex } from '../utils/katexRender';

export default function PhysicsCalculators({ onSendToAnto }) {
  const [activeTopic, setActiveTopic] = useState('mru');

  // Estados de calculadoras fundamentales MRU y MRUV
  const [mru, setMru] = useState({ d: '100', v: '20', t: '5' });
  const [mruvAceleracion, setMruvAceleracion] = useState({ v0: '0', vf: '25', t: '5' });
  const [mruvVelocidadFinal, setMruvVelocidadFinal] = useState({ v0: '10', a: '3', t: '6' });
  const [mruvDistancia, setMruvDistancia] = useState({ v0: '5', a: '2', t: '4' });
  const [mruvDistanciaMedia, setMruvDistanciaMedia] = useState({ v0: '10', vf: '30', t: '5' });

  const topics = [
    { id: 'mru', title: 'MRU - Velocidad Constante', formula: 'v = \\frac{d}{t}', icon: '🚗' },
    { id: 'mruvAceleracion', title: 'MRUV - Aceleración (a)', formula: 'a = \\frac{v_f - v_0}{t}', icon: '🏎️' },
    { id: 'mruvVelocidadFinal', title: 'MRUV - Velocidad Final (v_f)', formula: 'v_f = v_0 + a \\cdot t', icon: '🏁' },
    { id: 'mruvDistancia', title: 'MRUV - Distancia (d)', formula: 'd = v_0 t + \\frac{1}{2}a t^2', icon: '📏' },
    { id: 'mruvDistanciaMedia', title: 'MRUV - Distancia por Vel. Media', formula: 'd = \\left(\\frac{v_0 + v_f}{2}\\right) \\cdot t', icon: '⏱️' },
  ];

  const handleSendQuery = (text) => {
    if (onSendToAnto) {
      onSendToAnto(text);
    }
  };

  return (
    <div className="calculators-grid">
      {/* Selector de Temas MRU & MRUV */}
      <div className="topic-selector glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calculator size={20} color="var(--accent-purple)" />
          Calculadoras MRU y MRUV
        </h3>
        {topics.map((t) => (
          <button
            key={t.id}
            className={`topic-btn ${activeTopic === t.id ? 'active' : ''}`}
            onClick={() => setActiveTopic(t.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span>{t.icon}</span>
              <span>{t.title}</span>
            </div>
            <ArrowRight size={16} style={{ opacity: activeTopic === t.id ? 1 : 0.4 }} />
          </button>
        ))}
      </div>

      {/* Panel de Calculadora Seleccionada */}
      <div className="glass-panel calculator-panel">
        {/* 1. MRU */}
        {activeTopic === 'mru' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🚗 MRU - Velocidad Constante</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula la velocidad constante a partir de la distancia y el tiempo.
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('v = \\frac{d}{t} \\quad | \\quad d = v \\cdot t \\quad | \\quad t = \\frac{d}{v}') }} />

            <div className="inputs-grid">
              <div className="input-field-group">
                <label>Distancia (d) <span>en metros (m)</span></label>
                <input type="number" value={mru.d} onChange={(e) => setMru({ ...mru, d: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Tiempo (t) <span>en segundos (s)</span></label>
                <input type="number" value={mru.t} onChange={(e) => setMru({ ...mru, t: e.target.value })} />
              </div>
            </div>

            {parseFloat(mru.t) > 0 && (
              <div className="result-box" style={{ marginTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Velocidad Constante (v)</div>
                  <div className="result-val">{(parseFloat(mru.d) / parseFloat(mru.t)).toFixed(2)} m/s</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Equivale a {((parseFloat(mru.d) / parseFloat(mru.t)) * 3.6).toFixed(2)} km/h
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleSendQuery(`Un objeto en MRU recorre ${mru.d} metros en ${mru.t} segundos. ¿Cuál es su velocidad?`)}
                >
                  <Send size={16} /> Preguntar a Anto 🫶
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. MRUV - Aceleración */}
        {activeTopic === 'mruvAceleracion' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🏎️ MRUV - Aceleración</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula la tasa de cambio de velocidad por segundo.
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('a = \\frac{v_f - v_0}{t}') }} />

            <div className="inputs-grid">
              <div className="input-field-group">
                <label>Velocidad inicial (v₀) <span>m/s</span></label>
                <input type="number" value={mruvAceleracion.v0} onChange={(e) => setMruvAceleracion({ ...mruvAceleracion, v0: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Velocidad final (v_f) <span>m/s</span></label>
                <input type="number" value={mruvAceleracion.vf} onChange={(e) => setMruvAceleracion({ ...mruvAceleracion, vf: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Tiempo (t) <span>segundos</span></label>
                <input type="number" value={mruvAceleracion.t} onChange={(e) => setMruvAceleracion({ ...mruvAceleracion, t: e.target.value })} />
              </div>
            </div>

            {parseFloat(mruvAceleracion.t) > 0 && (
              <div className="result-box" style={{ marginTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Aceleración (a)</div>
                  <div className="result-val">{((parseFloat(mruvAceleracion.vf) - parseFloat(mruvAceleracion.v0)) / parseFloat(mruvAceleracion.t)).toFixed(2)} m/s²</div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleSendQuery(`En MRUV, un móvil pasa de ${mruvAceleracion.v0} m/s a ${mruvAceleracion.vf} m/s en ${mruvAceleracion.t} s. ¿Cuál es la aceleración?`)}
                >
                  <Send size={16} /> Preguntar a Anto 🫶
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. MRUV - Velocidad Final */}
        {activeTopic === 'mruvVelocidadFinal' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🏁 MRUV - Velocidad Final</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula la velocidad final alcanzada con una aceleración dada.
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('v_f = v_0 + a \\cdot t') }} />

            <div className="inputs-grid">
              <div className="input-field-group">
                <label>Velocidad inicial (v₀) <span>m/s</span></label>
                <input type="number" value={mruvVelocidadFinal.v0} onChange={(e) => setMruvVelocidadFinal({ ...mruvVelocidadFinal, v0: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Aceleración (a) <span>m/s²</span></label>
                <input type="number" value={mruvVelocidadFinal.a} onChange={(e) => setMruvVelocidadFinal({ ...mruvVelocidadFinal, a: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Tiempo (t) <span>s</span></label>
                <input type="number" value={mruvVelocidadFinal.t} onChange={(e) => setMruvVelocidadFinal({ ...mruvVelocidadFinal, t: e.target.value })} />
              </div>
            </div>

            <div className="result-box" style={{ marginTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Velocidad Final (v_f)</div>
                <div className="result-val">
                  {(parseFloat(mruvVelocidadFinal.v0) + parseFloat(mruvVelocidadFinal.a) * parseFloat(mruvVelocidadFinal.t)).toFixed(2)} m/s
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleSendQuery(`En MRUV, v₀=${mruvVelocidadFinal.v0} m/s, a=${mruvVelocidadFinal.a} m/s² y t=${mruvVelocidadFinal.t} s. ¿Cuál es la velocidad final?`)}
              >
                <Send size={16} /> Preguntar a Anto 🫶
              </button>
            </div>
          </div>
        )}

        {/* 4. MRUV - Distancia con Aceleración */}
        {activeTopic === 'mruvDistancia' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>📏 MRUV - Distancia con Aceleración</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula la distancia recorrida en función del tiempo y la aceleración.
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('d = v_0 t + \\frac{1}{2} a t^2') }} />

            <div className="inputs-grid">
              <div className="input-field-group">
                <label>Velocidad inicial (v₀) <span>m/s</span></label>
                <input type="number" value={mruvDistancia.v0} onChange={(e) => setMruvDistancia({ ...mruvDistancia, v0: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Aceleración (a) <span>m/s²</span></label>
                <input type="number" value={mruvDistancia.a} onChange={(e) => setMruvDistancia({ ...mruvDistancia, a: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Tiempo (t) <span>s</span></label>
                <input type="number" value={mruvDistancia.t} onChange={(e) => setMruvDistancia({ ...mruvDistancia, t: e.target.value })} />
              </div>
            </div>

            <div className="result-box" style={{ marginTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Distancia Recorrida (d)</div>
                <div className="result-val">
                  {((parseFloat(mruvDistancia.v0) * parseFloat(mruvDistancia.t)) + 0.5 * parseFloat(mruvDistancia.a) * Math.pow(parseFloat(mruvDistancia.t), 2)).toFixed(2)} m
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleSendQuery(`En MRUV con v₀=${mruvDistancia.v0} m/s y a=${mruvDistancia.a} m/s², ¿qué distancia recorre en ${mruvDistancia.t} segundos?`)}
              >
                <Send size={16} /> Preguntar a Anto 🫶
              </button>
            </div>
          </div>
        )}

        {/* 5. MRUV - Distancia por Velocidad Media */}
        {activeTopic === 'mruvDistanciaMedia' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>⏱️ MRUV - Distancia por Velocidad Media</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula la distancia usando la velocidad inicial, final y el tiempo.
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('d = \\left(\\frac{v_0 + v_f}{2}\\right) \\cdot t') }} />

            <div className="inputs-grid">
              <div className="input-field-group">
                <label>Velocidad inicial (v₀) <span>m/s</span></label>
                <input type="number" value={mruvDistanciaMedia.v0} onChange={(e) => setMruvDistanciaMedia({ ...mruvDistanciaMedia, v0: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Velocidad final (v_f) <span>m/s</span></label>
                <input type="number" value={mruvDistanciaMedia.vf} onChange={(e) => setMruvDistanciaMedia({ ...mruvDistanciaMedia, vf: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Tiempo (t) <span>s</span></label>
                <input type="number" value={mruvDistanciaMedia.t} onChange={(e) => setMruvDistanciaMedia({ ...mruvDistanciaMedia, t: e.target.value })} />
              </div>
            </div>

            <div className="result-box" style={{ marginTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Distancia por Vel. Media (d)</div>
                <div className="result-val">
                  {(((parseFloat(mruvDistanciaMedia.v0) + parseFloat(mruvDistanciaMedia.vf)) / 2) * parseFloat(mruvDistanciaMedia.t)).toFixed(2)} m
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleSendQuery(`En MRUV, un auto pasa de ${mruvDistanciaMedia.v0} m/s a ${mruvDistanciaMedia.vf} m/s en ${mruvDistanciaMedia.t} s. ¿Qué distancia recorrió?`)}
              >
                <Send size={16} /> Preguntar a Anto 🫶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
