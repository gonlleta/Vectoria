import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, VolumeX, Sparkles, Copy, Check, Lightbulb, ArrowRight, RefreshCw, Zap, Image, Camera, X } from 'lucide-react';
import { solvePhysicsProblem, analyzeImageProblem } from '../services/antoPhysicsEngine';
import { askGeminiAnto } from '../services/geminiApi';
import { renderLatex, renderBlockLatex } from '../utils/katexRender';

const QUICK_PROMPTS = [
  "📷 Adjuntar foto de mi ejercicio",
  "🚗 Auto a 20 m/s frena en 5 s. ¿Aceleración?",
  "🍎 Manzana cae desde 20 m. ¿Tiempo y v_f?",
  "📦 Bloque de 10 kg con fuerza de 50 N. ¿Aceleración?",
  "⚡ Masa de 5 kg moviéndose a 10 m/s. ¿Energía cinética?"
];

export default function AntoChat({ apiKey }) {
  const [messages, setMessages] = useState([
    {
      sender: 'anto',
      text: '¡Hola! Soy Anto 🫶, tu tutora de física. Puedes escribirme tu ejercicio o subir una foto/captura de tu libro o examen para resolverlo paso a paso 📷✨',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // Data URL de la imagen cargada
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Manejar selección de foto / archivo de imagen
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen (PNG, JPG, JPEG).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if ((!query.trim() && !selectedImage) || loading) return;

    // Si hizo clic en la chip de adjuntar foto, abrir selector de archivos
    if (query === "📷 Adjuntar foto de mi ejercicio") {
      fileInputRef.current?.click();
      return;
    }

    const currentImage = selectedImage;
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const userMsg = {
      sender: 'user',
      text: query,
      image: currentImage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      if (apiKey) {
        // Usar Gemini 1.5 Flash Multimodal (Analizar texto + foto)
        const geminiResponse = await askGeminiAnto(query, apiKey, currentImage);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'anto',
            text: geminiResponse,
            isGemini: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        // Usar el motor nativo de Anto (con detector de imagen o texto)
        await new Promise((resolve) => setTimeout(resolve, 600));

        let solution;
        if (currentImage) {
          solution = analyzeImageProblem(currentImage, query);
        } else {
          solution = solvePhysicsProblem(query);
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'anto',
            solution: solution,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'anto',
          text: `Ups, ocurrió un error analizando el ejercicio: ${error.message}. ¡Prueba nuevamente o revisa tu API Key! 🫶`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="chat-wrapper">
      {/* Área Principal de Chat */}
      <div className="glass-panel chat-main">
        {/* Historial de Mensajes */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.sender}`}>
              {msg.sender === 'anto' ? (
                <img src="/anto_avatar.png" alt="Anto Avatar" className="msg-avatar" />
              ) : (
                <div className="user-avatar-badge">Tú</div>
              )}

              <div className="message-bubble">
                {/* Mostrar foto adjunta si existe */}
                {msg.image && (
                  <div style={{ marginBottom: '0.75rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    <img src={msg.image} alt="Foto del ejercicio adjuntada" style={{ maxWidth: '100%', maxHeight: '250px', display: 'block', objectFit: 'contain', background: '#020617' }} />
                  </div>
                )}

                {msg.text && (
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {msg.text}
                  </div>
                )}

                {/* Tarjeta de Solución Estructurada de Anto */}
                {msg.solution && (
                  <div className="solution-card">
                    <div className="solution-header">
                      <span className="solution-tag">
                        <Zap size={12} /> {msg.solution.category}
                      </span>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => copyToClipboard(JSON.stringify(msg.solution, null, 2), idx)}
                      >
                        {copiedIndex === idx ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        {copiedIndex === idx ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>{msg.solution.title}</h4>

                    {/* Explicación si es conceptual */}
                    {msg.solution.isConceptual ? (
                      <div>
                        <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                          {msg.solution.explicacion}
                        </p>
                        {msg.solution.formula && (
                          <div
                            className="formula-box"
                            style={{ marginTop: '0.85rem' }}
                            dangerouslySetInnerHTML={{ __html: renderBlockLatex(msg.solution.formula) }}
                          />
                        )}
                      </div>
                    ) : (
                      /* Desglose de problema numérico paso a paso */
                      <>
                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                          {msg.solution.explicacion}
                        </p>

                        {/* Datos del problema */}
                        {msg.solution.datos && msg.solution.datos.length > 0 && (
                          <div>
                            <div className="section-title">📋 Datos Provistos (Sistema SI)</div>
                            <div className="data-grid">
                              {msg.solution.datos.map((d, i) => (
                                <div key={i} className="data-pill">
                                  <span className="label">{d.label}</span>
                                  <span className="val">{d.val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Fórmula aplicable */}
                        {msg.solution.formula && (
                          <div>
                            <div className="section-title">🎯 Fórmula Aplicada</div>
                            <div
                              className="formula-box"
                              dangerouslySetInnerHTML={{ __html: renderBlockLatex(msg.solution.formula) }}
                            />
                          </div>
                        )}

                        {/* Pasos de resolución */}
                        {msg.solution.pasos && (
                          <div>
                            <div className="section-title">📝 Procedimiento Paso a Paso</div>
                            <div className="steps-list">
                              {msg.solution.pasos.map((paso, i) => (
                                <div key={i} className="step-item">
                                  <span className="step-num">{i + 1}</span>
                                  <span>{paso}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resultado Final Destacado */}
                        {msg.solution.resultado && (
                          <div className="result-box">
                            <div>
                              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8, color: '#e9d5ff' }}>
                                Resultado {msg.solution.incognita || ''}
                              </div>
                              <div
                                className="result-val"
                                dangerouslySetInnerHTML={{ __html: renderBlockLatex(msg.solution.resultado) }}
                              />
                            </div>
                            <Sparkles size={28} color="#ec4899" />
                          </div>
                        )}
                      </>
                    )}

                    {/* Tip de Anto */}
                    {msg.solution.tip && (
                      <div className="anto-tip-box">
                        <Lightbulb size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Tip de Anto 🫶: </strong> {msg.solution.tip}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.35rem', textAlign: 'right' }}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row anto">
              <img src="/anto_avatar.png" alt="Anto Avatar" className="msg-avatar" />
              <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Anto 🫶 está escaneando la foto y calculando el ejercicio...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar, Previsualización de Foto y Sugerencias */}
        <div className="chat-input-area">
          <div className="quick-prompts">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                className="prompt-chip"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Miniatura de Imagen Seleccionada antes de enviar */}
          {selectedImage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(168, 85, 247, 0.15)', padding: '0.5rem 0.85rem', borderRadius: '12px', border: '1px solid var(--accent-purple)' }}>
              <img src={selectedImage} alt="Vista previa" style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ flex: 1, fontSize: '0.82rem', color: '#fff' }}>
                <strong>Foto adjuntada lista para escanear</strong>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Anto resolverá el problema de esta imagen</div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.25rem' }} onClick={removeSelectedImage}>
                <X size={16} />
              </button>
            </div>
          )}

          <div className="input-box-wrapper">
            {/* Input oculto para cargar archivos de foto */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />

            {/* Botón para Adjuntar Foto */}
            <button
              className="btn-secondary"
              style={{ padding: '0.4rem 0.6rem', border: 'none', background: 'transparent' }}
              onClick={() => fileInputRef.current?.click()}
              title="Subir foto de un ejercicio o examen"
            >
              <Camera size={20} color="var(--accent-cyan)" />
            </button>

            <input
              type="text"
              className="chat-input"
              placeholder={selectedImage ? "Añade algún comentario sobre la foto (opcional)..." : "Escribe tu ejercicio o sube una foto con el botón de cámara..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />

            <button
              className="send-btn"
              onClick={() => handleSend()}
              disabled={(!input.trim() && !selectedImage) || loading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Perfil de Anto */}
      <div className="glass-panel anto-sidebar">
        <div className="anto-card-hero">
          <div className="anto-avatar-large">
            <img src="/anto_avatar.png" alt="Anto 🫶" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
            Anto <span className="gradient-text">🫶</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            IA Tutora Especialista en MRU y MRUV 🏎️
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-val">MRU</div>
            <div className="stat-lbl">Velocidad Constante</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">MRUV</div>
            <div className="stat-lbl">Aceleración & Frenado</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={16} /> Especialidad 100% MRU / MRUV
          </h4>
          <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', lineHeight: '1.7' }}>
            <li>Velocidad Constante ($v = d/t$)</li>
            <li>Aceleración y Frenado ($a = \Delta v/t$)</li>
            <li>Ecuación de Torricelli ($v_f^2 = v_0^2 + 2ad$)</li>
            <li>Encuentro de 2 Móviles ($t_e = D / (v_1 + v_2)$)</li>
            <li>Fotos de Ejercicios de Movimiento 📷</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
