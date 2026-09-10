import React, { useState } from 'react';
import { BookOpen, Search, Send, Sparkles } from 'lucide-react';
import { renderBlockLatex } from '../utils/katexRender';

const FORMULA_DATABASE = [
  {
    id: 1,
    title: 'Velocidad en MRU',
    category: 'MRU',
    formula: 'v = \\frac{d}{t}',
    variables: [
      { name: 'v', desc: 'Velocidad constante (m/s)' },
      { name: 'd', desc: 'Distancia recorrida (m)' },
      { name: 't', desc: 'Tiempo transcurrido (s)' }
    ],
    antoNote: 'En el MRU la velocidad no cambia nunca y la aceleración es 0 m/s².'
  },
  {
    id: 2,
    title: 'Distancia / Posición en MRU',
    category: 'MRU',
    formula: 'd = v \\cdot t',
    variables: [
      { name: 'd', desc: 'Distancia (m)' },
      { name: 'v', desc: 'Velocidad (m/s)' },
      { name: 't', desc: 'Tiempo (s)' }
    ],
    antoNote: 'Multiplica la velocidad constante por el tiempo empleado.'
  },
  {
    id: 3,
    title: 'Aceleración en MRUV',
    category: 'MRUV',
    formula: 'a = \\frac{v_f - v_0}{t}',
    variables: [
      { name: 'a', desc: 'Aceleración constante (m/s²)' },
      { name: 'v_f', desc: 'Velocidad final (m/s)' },
      { name: 'v_0', desc: 'Velocidad inicial (m/s)' },
      { name: 't', desc: 'Tiempo (s)' }
    ],
    antoNote: 'Mide la variación de la velocidad por cada segundo que pasa.'
  },
  {
    id: 4,
    title: 'Velocidad Final en MRUV',
    category: 'MRUV',
    formula: 'v_f = v_0 + a \\cdot t',
    variables: [
      { name: 'v_f', desc: 'Velocidad final (m/s)' },
      { name: 'v_0', desc: 'Velocidad inicial (m/s)' },
      { name: 'a', desc: 'Aceleración (m/s²)' },
      { name: 't', desc: 'Tiempo (s)' }
    ],
    antoNote: 'Si parte del reposo, v₀ es 0. Si frena hasta detenerse, v_f es 0.'
  },
  {
    id: 5,
    title: 'Distancia con Aceleración (MRUV)',
    category: 'MRUV',
    formula: 'd = v_0 t + \\frac{1}{2} a t^2',
    variables: [
      { name: 'd', desc: 'Distancia recorrida (m)' },
      { name: 'v_0', desc: 'Velocidad inicial (m/s)' },
      { name: 'a', desc: 'Aceleración (m/s²)' },
      { name: 't', desc: 'Tiempo (s)' }
    ],
    antoNote: 'Calcula el espacio recorrido cuando el objeto acelera o frena.'
  },
  {
    id: 6,
    title: 'Distancia por Velocidad Media (MRUV)',
    category: 'MRUV',
    formula: 'd = \\left(\\frac{v_0 + v_f}{2}\\right) \\cdot t',
    variables: [
      { name: 'd', desc: 'Distancia (m)' },
      { name: 'v_0', desc: 'Velocidad inicial (m/s)' },
      { name: 'v_f', desc: 'Velocidad final (m/s)' },
      { name: 't', desc: 'Tiempo (s)' }
    ],
    antoNote: 'Útil cuando conoces la velocidad inicial, final y el tiempo, sin requerir la aceleración.'
  }
];

export default function FormulaLibrary({ onSendToAnto }) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todas');

  const categories = ['Todas', 'MRU', 'MRUV'];

  const filteredFormulas = FORMULA_DATABASE.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.antoNote.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'Todas' || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Controles de Búsqueda y Filtros */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={24} color="var(--accent-purple)" />
            Fórmulas Esenciales de MRU y MRUV
          </h2>

          <div className="input-box-wrapper" style={{ width: '280px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="chat-input"
              placeholder="Buscar fórmula MRU/MRUV..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`prompt-chip ${selectedCat === cat ? 'active' : ''}`}
              style={{
                background: selectedCat === cat ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
                color: selectedCat === cat ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => setSelectedCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tarjetas de Fórmulas */}
      <div className="formula-cards-grid">
        {filteredFormulas.map((item) => (
          <div key={item.id} className="glass-panel formula-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="solution-tag">{item.category}</span>
              <Sparkles size={16} color="var(--accent-pink)" />
            </div>

            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{item.title}</h3>

            <div
              className="formula-box"
              dangerouslySetInnerHTML={{ __html: renderBlockLatex(item.formula) }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {item.variables.map((v, i) => (
                <div key={i}>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{v.name}:</strong> {v.desc}
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.82rem', color: '#fde68a', background: 'rgba(245, 158, 11, 0.08)', padding: '0.6rem', borderRadius: '8px', borderLeft: '2px solid #f59e0b' }}>
              <strong>Tip de Anto 🫶:</strong> {item.antoNote}
            </div>

            <button
              className="btn-secondary"
              style={{ marginTop: 'auto', width: '100%', fontSize: '0.82rem' }}
              onClick={() => onSendToAnto && onSendToAnto(`Explicame la fórmula de ${item.title}: ${item.formula}`)}
            >
              <Send size={14} /> Resolver con Anto 🫶
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
