import React, { useState } from 'react';
import { Calculator, ArrowRight, Zap, RefreshCw, Sparkles, Send } from 'lucide-react';
import { renderBlockLatex } from '../utils/katexRender';

export default function PhysicsCalculators({ onSendToAnto }) {
  const [activeTopic, setActiveTopic] = useState('mru');

  // Estados de insumos para calculadoras
  const [mru, setMru] = useState({ d: '100', v: '20', t: '5' });
  const [mruv, setMruv] = useState({ v0: '0', vf: '30', a: '6', t: '5' });
  const [caida, setCaida] = useState({ h: '45', g: '9.8' });
  const [newton, setNewton] = useState({ m: '12', a: '4' });
  const [peso, setPeso] = useState({ m: '70', g: '9.8' });
  const [ek, setEk] = useState({ m: '1000', v: '25' });
  const [ep, setEp] = useState({ m: '15', h: '10', g: '9.8' });
  const [presion, setPresion] = useState({ F: '500', A: '2' });
  const [ohm, setOhm] = useState({ V: '12', R: '4' });

  const topics = [
    { id: 'mru', title: 'MRU (Velocidad Constante)', formula: 'v = \\frac{d}{t}', icon: '🚗' },
    { id: 'mruv', title: 'MRUV (Aceleración)', formula: 'a = \\frac{v_f - v_0}{t}', icon: '🏎️' },
    { id: 'caida', title: 'Caída Libre / Tiro Vertical', formula: 'h = \\frac{1}{2} g t^2', icon: '🍎' },
    { id: 'newton', title: '2ª Ley de Newton', formula: 'F = m \\cdot a', icon: '📦' },
    { id: 'peso', title: 'Peso Gravitatorio', formula: 'P = m \\cdot g', icon: '⚖️' },
    { id: 'ek', title: 'Energía Cinética', formula: 'E_k = \\frac{1}{2} m v^2', icon: '⚡' },
    { id: 'ep', title: 'Energía Potencial', formula: 'E_p = m \\cdot g \\cdot h', icon: '⛰️' },
    { id: 'presion', title: 'Presión Hidrostática', formula: 'P = \\frac{F}{A}', icon: '🌊' },
    { id: 'ohm', title: 'Ley de Ohm', formula: 'V = I \\cdot R', icon: '💡' },
  ];

  const handleSendQuery = (text) => {
    if (onSendToAnto) {
      onSendToAnto(text);
    }
  };

  return (
    <div className="calculators-grid">
      {/* Selector de Temas */}
      <div className="topic-selector glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calculator size={20} color="var(--accent-purple)" />
          Herramientas de Cálculo
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
        {/* MRU */}
        {activeTopic === 'mru' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🚗 Movimiento Rectilíneo Uniforme (MRU)</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula la velocidad, distancia o tiempo cuando la velocidad permanece constante sin aceleración.
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('v = \\frac{d}{t} \\quad | \\quad d = v \\cdot t') }} />

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

            {/* Resultado calculado */}
            {parseFloat(mru.t) > 0 && (
              <div className="result-box" style={{ marginTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Velocidad Calculada (v)</div>
                  <div className="result-val">{(parseFloat(mru.d) / parseFloat(mru.t)).toFixed(2)} m/s</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Equivale a {((parseFloat(mru.d) / parseFloat(mru.t)) * 3.6).toFixed(2)} km/h
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleSendQuery(`Un objeto recorre ${mru.d} metros en ${mru.t} segundos. ¿Cuál es su velocidad?`)}
                >
                  <Send size={16} /> Preguntar a Anto 🫶
                </button>
              </div>
            )}
          </div>
        )}

        {/* MRUV */}
        {activeTopic === 'mruv' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🏎️ MRUV (Movimiento Acelerado)</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula el cambio de velocidad por unidad de tiempo (aceleración).
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('a = \\frac{v_f - v_0}{t} \\quad | \\quad d = v_0 t + \\frac{1}{2}a t^2') }} />

            <div className="inputs-grid">
              <div className="input-field-group">
                <label>Velocidad inicial (v₀) <span>m/s</span></label>
                <input type="number" value={mruv.v0} onChange={(e) => setMruv({ ...mruv, v0: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Velocidad final (v_f) <span>m/s</span></label>
                <input type="number" value={mruv.vf} onChange={(e) => setMruv({ ...mruv, vf: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Tiempo (t) <span>s</span></label>
                <input type="number" value={mruv.t} onChange={(e) => setMruv({ ...mruv, t: e.target.value })} />
              </div>
            </div>

            {parseFloat(mruv.t) > 0 && (
              <div className="result-box" style={{ marginTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Aceleración Calculada (a)</div>
                  <div className="result-val">{((parseFloat(mruv.vf) - parseFloat(mruv.v0)) / parseFloat(mruv.t)).toFixed(2)} m/s²</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Distancia recorrida: {((parseFloat(mruv.v0) * parseFloat(mruv.t)) + 0.5 * ((parseFloat(mruv.vf) - parseFloat(mruv.v0)) / parseFloat(mruv.t)) * Math.pow(parseFloat(mruv.t), 2)).toFixed(2)} m
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleSendQuery(`Un auto pasa de ${mruv.v0} m/s a ${mruv.vf} m/s en ${mruv.t} segundos. ¿Cuál es su aceleración?`)}
                >
                  <Send size={16} /> Preguntar a Anto 🫶
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2da Ley de Newton */}
        {activeTopic === 'newton' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>📦 2ª Ley de Newton</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula la fuerza requerida para acelerar un cuerpo de cierta masa.
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('F = m \\cdot a') }} />

            <div className="inputs-grid">
              <div className="input-field-group">
                <label>Masa (m) <span>en kg</span></label>
                <input type="number" value={newton.m} onChange={(e) => setNewton({ ...newton, m: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Aceleración (a) <span>en m/s²</span></label>
                <input type="number" value={newton.a} onChange={(e) => setNewton({ ...newton, a: e.target.value })} />
              </div>
            </div>

            <div className="result-box" style={{ marginTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Fuerza Resultante (F)</div>
                <div className="result-val">{(parseFloat(newton.m) * parseFloat(newton.a)).toFixed(2)} N</div>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleSendQuery(`¿Qué fuerza se necesita para acelerar un bloque de ${newton.m} kg a ${newton.a} m/s²?`)}
              >
                <Send size={16} /> Preguntar a Anto 🫶
              </button>
            </div>
          </div>
        )}

        {/* Energía Cinética */}
        {activeTopic === 'ek' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>⚡ Energía Cinética (E_k)</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Calcula la energía asociada al movimiento de un cuerpo en Joules (J).
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('E_k = \\frac{1}{2} m v^2') }} />

            <div className="inputs-grid">
              <div className="input-field-group">
                <label>Masa (m) <span>en kg</span></label>
                <input type="number" value={ek.m} onChange={(e) => setEk({ ...ek, m: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Velocidad (v) <span>en m/s</span></label>
                <input type="number" value={ek.v} onChange={(e) => setEk({ ...ek, v: e.target.value })} />
              </div>
            </div>

            <div className="result-box" style={{ marginTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Energía Cinética (E_k)</div>
                <div className="result-val">{(0.5 * parseFloat(ek.m) * Math.pow(parseFloat(ek.v), 2)).toFixed(2)} J</div>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleSendQuery(`¿Cuál es la energía cinética de una masa de ${ek.m} kg que se mueve a ${ek.v} m/s?`)}
              >
                <Send size={16} /> Preguntar a Anto 🫶
              </button>
            </div>
          </div>
        )}

        {/* Ley de Ohm */}
        {activeTopic === 'ohm' && (
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>💡 Ley de Ohm (Circuitos)</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Relación entre voltaje, corriente y resistencia eléctrica.
            </p>

            <div className="formula-box" style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: renderBlockLatex('V = I \\cdot R \\quad | \\quad I = \\frac{V}{R}') }} />

            <div className="inputs-grid">
              <div className="input-field-group">
                <label>Voltaje (V) <span>en Voltios (V)</span></label>
                <input type="number" value={ohm.V} onChange={(e) => setOhm({ ...ohm, V: e.target.value })} />
              </div>
              <div className="input-field-group">
                <label>Resistencia (R) <span>en Ohmios (Ω)</span></label>
                <input type="number" value={ohm.R} onChange={(e) => setOhm({ ...ohm, R: e.target.value })} />
              </div>
            </div>

            {parseFloat(ohm.R) > 0 && (
              <div className="result-box" style={{ marginTop: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Corriente Eléctrica (I)</div>
                  <div className="result-val">{(parseFloat(ohm.V) / parseFloat(ohm.R)).toFixed(2)} A</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Potencia disipada: {(Math.pow(parseFloat(ohm.V), 2) / parseFloat(ohm.R)).toFixed(2)} W (Watts)
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleSendQuery(`En un circuito con un voltaje de ${ohm.V} V y una resistencia de ${ohm.R} Ω, ¿cuál es la corriente eléctrica?`)}
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
