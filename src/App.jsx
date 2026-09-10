import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AntoChat from './components/AntoChat';
import PhysicsCalculators from './components/PhysicsCalculators';
import PhysicsVisualizer from './components/PhysicsVisualizer';
import FormulaLibrary from './components/FormulaLibrary';
import PracticeQuiz from './components/PracticeQuiz';
import SettingsModal from './components/SettingsModal';
import './styles/main.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prefilledQuery, setPrefilledQuery] = useState(null);

  const handleSendToAnto = (query) => {
    setPrefilledQuery(query);
    setActiveTab('chat');
  };

  return (
    <div className="app-container">
      {/* Barra de navegación superior */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        apiKey={apiKey}
      />

      {/* Vistas Principales segun el Tab Activo */}
      <main style={{ flex: 1 }}>
        {activeTab === 'chat' && <AntoChat apiKey={apiKey} initialQuery={prefilledQuery} />}
        {activeTab === 'calculators' && <PhysicsCalculators onSendToAnto={handleSendToAnto} />}
        {activeTab === 'visualizer' && <PhysicsVisualizer />}
        {activeTab === 'formulas' && <FormulaLibrary onSendToAnto={handleSendToAnto} />}
        {activeTab === 'quiz' && <PracticeQuiz />}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Anto 🫶 — Tu Tutora Inteligente de Física Básica • Desarrollado con React, KaTeX y Canvas 2D
      </footer>

      {/* Modal de Configuración */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
    </div>
  );
}
