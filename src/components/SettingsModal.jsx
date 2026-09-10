import React, { useState } from 'react';
import { X, Key, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey }) {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setInputKey('');
    setApiKey('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} color="var(--accent-purple)" />
            Configuración de IA Anto 🫶
          </h3>
          <button className="btn-secondary" style={{ padding: '0.35rem' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.6' }}>
            Anto 🫶 incluye un motor inteligente de resolución de física incorporado. Si deseas conectarle inteligencia conversacional Gemini extendida, puedes ingresar tu API Key a continuación:
          </p>

          <div className="input-field-group">
            <label>Google Gemini API Key (Opcional)</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
            />
          </div>
        </div>

        {saved && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Check size={16} /> ¡Configuración de API Key guardada!
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          {apiKey && (
            <button className="btn-secondary" onClick={handleClear} style={{ color: '#fca5a5' }}>
              Eliminar Key
            </button>
          )}
          <button className="btn-primary" onClick={handleSave}>
            <Sparkles size={16} /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
