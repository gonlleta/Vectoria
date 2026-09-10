import React, { useState } from 'react';
import { BookOpen, Search, Send, Sparkles } from 'lucide-react';
import { renderBlockLatex } from '../utils/katexRender';

const FORMULA_DATABASE = [
  {
    id: 1,
    title: 'Velocidad en MRU',
    category: 'Cinemática',
    formula: 'v = \\frac{d}{t}',
    variables: [
      { name: 'v', desc: 'Velocidad (m/s)' },
      { name: 'd', desc: 'Distancia (m)' },
      { name: 't', desc: 'Tiempo (s)' }
    ],
    antoNote: 'En el MRU la velocidad no cambia nunca con el tiempo.'
  },
  {
    id: 2,
    title: 'Aceleración en MRUV',
    category: 'Cinemática',
    formula: 'a = \\frac{v_f - v_0}{t}',
    variables: [
      { name: 'a', desc: 'Aceleración (m/s²)' },
      { name: 'v_f', desc: 'Velocidad Final (m/s)' },
      { name: 'v_0', desc: 'Velocidad Inicial (m/s)' },
      { name: 't', desc: 'Tiempo (s)' }
    ],
    antoNote: 'Si la aceleración es negativa, el móvil está desacelerando o frenando.'
  },
  {
    id: 3,
    title: 'Posición en MRUV',
    category: 'Cinemática',
    formula: 'd = v_0 t + \\frac{1}{2} a t^2',
    variables: [
      { name: 'd', desc: 'Distancia recorrida (m)' },
      { name: 'v_0', desc: 'Velocidad Inicial (m/s)' },
      { name: 'a', desc: 'Aceleración (m/s²)' },
      { name: 't', desc: 'Tiempo (s)' }
    ],
    antoNote: 'Si parte del reposo, el primer término v₀·t se vuelve cero.'
  },
  {
    id: 4,
    title: '2ª Ley de Newton',
    category: 'Dinámica',
    formula: 'F = m \\cdot a',
    variables: [
      { name: 'F', desc: 'Fuerza resultante (N)' },
      { name: 'm', desc: 'Masa (kg)' },
      { name: 'a', desc: 'Aceleración (m/s²)' }
    ],
    antoNote: 'Recuerda que 1 Newton equivale a 1 kg·m/s².'
  },
  {
    id: 5,
    title: 'Peso Gravitatorio',
    category: 'Dinámica',
    formula: 'P = m \\cdot g',
    variables: [
      { name: 'P', desc: 'Peso (N)' },
      { name: 'm', desc: 'Masa (kg)' },
      { name: 'g', desc: 'Gravedad (9.8 m/s² en la Tierra)' }
    ],
    antoNote: 'El peso es una fuerza vectorial dirigida hacia el centro de la Tierra.'
  },
  {
    id: 6,
    title: 'Energía Cinética',
    category: 'Trabajo y Energía',
    formula: 'E_k = \\frac{1}{2} m v^2',
    variables: [
      { name: 'E_k', desc: 'Energía Cinética (J)' },
      { name: 'm', desc: 'Masa (kg)' },
      { name: 'v', desc: 'Velocidad (m/s)' }
    ],
    antoNote: 'Al elevarse la velocidad al cuadrado, duplicar v quadruplica la energía.'
  },
  {
    id: 7,
    title: 'Energía Potencial Gravitatoria',
    category: 'Trabajo y Energía',
    formula: 'E_p = m \\cdot g \\cdot h',
    variables: [
      { name: 'E_p', desc: 'Energía Potencial (J)' },
      { name: 'm', desc: 'Masa (kg)' },
      { name: 'g', desc: 'Gravedad (m/s²)' },
      { name: 'h', desc: 'Altura (m)' }
    ],
    antoNote: 'Es la energía almacenada por la posición de altura del cuerpo.'
  },
  {
    id: 8,
    title: 'Ley de Ohm',
    category: 'Electricidad',
    formula: 'V = I \\cdot R',
    variables: [
      { name: 'V', desc: 'Voltaje / Tensión (V)' },
      { name: 'I', desc: 'Intensidad de corriente (A)' },
      { name: 'R', desc: 'Resistencia eléctrica (Ω)' }
    ],
    antoNote: 'Muestra cómo interactúan el voltaje, la corriente y la resistencia en un circuito.'
  }
];

export default function FormulaLibrary({ onSendToAnto }) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todas');

  const categories = ['Todas', 'Cinemática', 'Dinámica', 'Trabajo y Energía', 'Electricidad'];

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
            Biblioteca de Fórmulas y Teoría
          </h2>

          {/* Barra de búsqueda */}
          <div className="input-box-wrapper" style={{ width: '280px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="chat-input"
              placeholder="Buscar fórmula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Categorías */}
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

            {/* Variables */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {item.variables.map((v, i) => (
                <div key={i}>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{v.name}:</strong> {v.desc}
                </div>
              ))}
            </div>

            {/* Nota de Anto */}
            <div style={{ fontSize: '0.82rem', color: '#fde68a', background: 'rgba(245, 158, 11, 0.08)', padding: '0.6rem', borderRadius: '8px', borderLeft: '2px solid #f59e0b' }}>
              <strong>Nota de Anto 🫶:</strong> {item.antoNote}
            </div>

            <button
              className="btn-secondary"
              style={{ marginTop: 'auto', width: '100%', fontSize: '0.82rem' }}
              onClick={() => onSendToAnto && onSendToAnto(`Explicame detalladamente la fórmula ${item.title}: ${item.formula}`)}
            >
              <Send size={14} /> Resolver con Anto 🫶
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
