import React from 'react';
import { MessageSquare, Calculator, Activity, BookOpen, Award, Settings, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenSettings, apiKey }) {
  const navItems = [
    { id: 'chat', label: 'Chat & Solucionador', icon: MessageSquare },
    { id: 'calculators', label: 'Calculadoras', icon: Calculator },
    { id: 'visualizer', label: 'Simulador 2D', icon: Activity },
    { id: 'formulas', label: 'Formulario', icon: BookOpen },
    { id: 'quiz', label: 'Desafíos & Quiz', icon: Award },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="anto-avatar-nav">
          <img src="/anto_avatar.png" alt="Anto 🫶 Avatar" />
          <span className="online-badge" title="Anto está lista para ayudarte"></span>
        </div>
        <div>
          <div className="brand-title">
            <span>Anto</span>
            <span className="gradient-text">🫶</span>
          </div>
          <div className="brand-subtitle">Tu Tutora de Física con IA</div>
        </div>
      </div>

      <div className="nav-tabs">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`tab-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <button className="btn-secondary" onClick={onOpenSettings} title="Configuración de la IA">
        <Settings size={18} />
        {apiKey ? (
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <Sparkles size={14} /> Gemini Activo
          </span>
        ) : (
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>IA Integrada</span>
        )}
      </button>
    </nav>
  );
}
