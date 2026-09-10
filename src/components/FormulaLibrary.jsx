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
    antoNote: 'En el MRU la velocidad nunca cambia y la aceleración vale exactamente cero.'
  },
  {
    id: 2,
    title: 'Posición y Distancia en MRU',
    category: 'MRU',
    formula: 'd = v \\cdot t',
    variables: [
      { name: 'd', desc: 'Distancia recorrida (m)' },
      { name: 'v', desc: 'Velocidad constante (m/s)' },
      { name: 't', desc: 'Tiempo (s)' }
    ],
    antoNote: 'Permite calcular qué tan lejos llega un móvil que marcha a velocidad uniforme.'
  },
  {
    id: 3,
    title: 'Definición de Aceleración (MRUV)',
    category: 'MRUV',
    formula: 'a = \\frac{v_f - v_0}{t}',
    variables: [
      { name: 'a', desc: 'Aceleración constante (m/s²)' },
      { name: 'v_f', desc: 'Velocidad final (m/s)' },
      { name: 'v_0', desc: 'Velocidad inicial (m/s)' },
      { name: 't', desc: 'Tiempo (s)' }
    ],
    antoNote: 'Si el objeto frena, la aceleración resultante da con signo negativo.'
  },
  {
    id: 4,
    title: 'Posición con Aceleración (MRUV)',
    category: 'MRUV',
    formula: 'd = v_0 t + \\frac{1}{2} a t^2',
    variables: [
      { name: 'd', desc: 'Distancia (m)' },
      { name: 'v_0', desc: 'Velocidad inicial (m/s)' },
      { name: 'a', desc: 'Aceleración (m/s²)' },
      { name: 't', desc: 'Tiempo (s)' }
    ],
    antoNote: 'Si el móvil parte del reposo, el término v₀·t vale 0.'
  },
  {
    id: 5,
    title: 'Ecuación de Torricelli (Sin tiempo)',
    category: 'MRUV',
    formula: 'v_f^2 = v_0^2 + 2 a d',
    variables: [
      { name: 'v_f', desc: 'Velocidad final (m/s)' },
      { name: 'v_0', desc: 'Velocidad inicial (m/s)' },
      { name: 'a', desc: 'Aceleración (m/s²)' },
      { name: 'd', desc: 'Distancia (m)' }
    ],
    antoNote: 'Ideal para resolver ejercicios donde no te dan el dato del tiempo.'
  },
  {
    id: 6,
    title: 'Tiempo de Encuentro en MRU',
    category: 'Encuentro',
    formula: 't_e = \\frac{D}{v_1 + v_2}',
    variables: [
      { name: 't_e', desc: 'Tiempo de encuentro (s)' },
      { name: 'D', desc: 'Distancia inicial entre autos (m)' },
      { name: 'v_1, v_2', desc: 'Velocidades de los dos móviles (m/s)' }
    ],
    antoNote: 'Fórmula para dos móviles que viajan uno hacia el otro desde puntos opuestos.'
  }
];

export default function FormulaLibrary({ onSendToAnto }) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todas');

  const categories = ['Todas', 'MRU', 'MRUV', 'Encuentro'];

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
            Formulario Especializado en MRU y MRUV
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
              onClick={() => onSendToAnto && onSendToAnto(`Explicame detalladamente la fórmula de ${item.title}: ${item.formula}`)}
            >
              <Send size={14} /> Resolver con Anto 🫶
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
