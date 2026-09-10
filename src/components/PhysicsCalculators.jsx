import React, { useState } from 'react';
import { Calculator, ArrowRight, Send, Car, Zap, Flag } from 'lucide-react';
import { renderBlockLatex } from '../utils/katexRender';

export default function PhysicsCalculators({ onSendToAnto }) {
  const [activeTopic, setActiveTopic] = useState('mru');

  // Estados de calculadoras especializadas
  const [mru, setMru] = useState({ d: '100', v: '20', t: '5' });
  const [mruvAceleracion, setMruvAceleracion] = useState({ v0: '0', vf: '25', t: '5' });
  const [mruvDistancia, setMruvDistancia] = useState({ v0: '10', a: '2', t: '4' });
  const [mruvTorricelli, setMruvTorricelli] = useState({ v0: '0', a: '3', d: '150' });
  const [encuentro, setEncuentro] = useState({ D: '600', v1: '20', v2: '30' });

  const topics = [
    { id: 'mru', title: 'MRU - Velocidad Constante', formula: 'v = \\frac{d}{t}', icon: '🚗' },
    { id: 'mruvAceleracion', title: 'MRUV - Aceleración (a)', formula: 'a = \\frac{v_f - v_0}{t}', icon: '🏎️' },
    { id: 'mruvDistancia', title: 'MRUV - Distancia (d)', formula: 'd = v_0 t + \\frac{1}{2}a t^2', icon: '🏁' },
    { id: 'mruvTorricelli', title: 'MRUV - Ecuación de Torricelli', formula: 'v_f^2 = v_0^2 + 2ad', icon: '🛑' },
    { id: 'encuentro', title: 'MRU - Encuentro de 2 Móviles', formula: 't_e = \\frac{D}{v_1 + v_2}', icon: '🔀' },
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
              Calcula velocidad, distancia o tiempo sin aceleración.
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
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🏎️ MRUV - Cálculo de Aceleración</h3>
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

        {/* 3. MRUV - Distancia */}
        {activeTopic === 'mruvDistancia' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🏁 MRUV - Distancia Recorrida</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula el espacio recorrido con aceleración constante en cierto tiempo.
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

        {/* 4. Torricelli */}
        {activeTopic === 'mruvTorricelli' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🛑 MRUV - Ecuación de Torricelli</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula la velocidad final sin necesitar el parámetro tiempo.
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('v_f = \\sqrt{v_0^2 + 2 a d}') }} />

            <div className="inputs-grid">
              <div className="input-field-group">
                <label>Velocidad inicial (v₀) <span>m/s</span></label>
                <input type="number" value={mruvTorricelli.v0} onChange={(e) => setMruvTorricelli({ ...mruvTorricelli, v0: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Aceleración (a) <span>m/s²</span></label>
                <input type="number" value={mruvTorricelli.a} onChange={(e) => setMruvTorricelli({ ...mruvTorricelli, a: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Distancia (d) <span>m</span></label>
                <input type="number" value={mruvTorricelli.d} onChange={(e) => setMruvTorricelli({ ...mruvTorricelli, d: e.target.value })} />
              </div>
            </div>

            <div className="result-box" style={{ marginTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Velocidad Final (v_f)</div>
                <div className="result-val">
                  {Math.sqrt(Math.pow(parseFloat(mruvTorricelli.v0), 2) + 2 * parseFloat(mruvTorricelli.a) * parseFloat(mruvTorricelli.d)).toFixed(2)} m/s
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleSendQuery(`En MRUV, un cuerpo con v₀=${mruvTorricelli.v0} m/s y a=${mruvTorricelli.a} m/s² recorre ${mruvTorricelli.d} m. ¿Cuál es su velocidad final?`)}
              >
                <Send size={16} /> Preguntar a Anto 🫶
              </button>
            </div>
          </div>
        )}

        {/* 5. Encuentro de Móviles */}
        {activeTopic === 'encuentro' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🔀 MRU - Encuentro de Dos Móviles</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula el tiempo y el punto donde se cruzan dos autos en movimiento rectilíneo.
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('t_e = \\frac{D}{v_1 + v_2} \\quad | \\quad x_e = v_1 \\cdot t_e') }} />

            <div className="inputs-grid">
              <div className="input-field-group">
                <label>Distancia inicial entre autos (D) <span>m</span></label>
                <input type="number" value={encuentro.D} onChange={(e) => setEncuentro({ ...encuentro, D: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Velocidad Auto 1 (v₁) <span>m/s</span></label>
                <input type="number" value={encuentro.v1} onChange={(e) => setEncuentro({ ...encuentro, v1: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Velocidad Auto 2 (v₂) <span>m/s</span></label>
                <input type="number" value={encuentro.v2} onChange={(e) => setEncuentro({ ...encuentro, v2: e.target.value })} />
              </div>
            </div>

            {(parseFloat(encuentro.v1) + parseFloat(encuentro.v2)) > 0 && (
              <div className="result-box" style={{ marginTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Tiempo de Encuentro (t_e)</div>
                  <div className="result-val">
                    {(parseFloat(encuentro.D) / (parseFloat(encuentro.v1) + parseFloat(encuentro.v2))).toFixed(2)} s
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Punto de encuentro: {(parseFloat(encuentro.v1) * (parseFloat(encuentro.D) / (parseFloat(encuentro.v1) + parseFloat(encuentro.v2)))).toFixed(2)} m del Auto 1
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleSendQuery(`Dos autos separados por ${encuentro.D} metros se mueven frente a frente a ${encuentro.v1} m/s y ${encuentro.v2} m/s. ¿Cuándo y dónde se encuentran?`)}
                >
                  <Send size={16} /> Preguntar a Anto 🫶
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
