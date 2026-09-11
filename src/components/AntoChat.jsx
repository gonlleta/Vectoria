import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, VolumeX, Sparkles, Copy, Check, Lightbulb, ArrowRight, RefreshCw, Zap, Camera, X, Mic, MicOff, Edit3, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { solvePhysicsProblem, analyzeImageProblem } from '../services/antoPhysicsEngine';
import { askGeminiAnto } from '../services/geminiApi';
import { scanImageText } from '../services/ocrService';
import { renderLatex, renderBlockLatex } from '../utils/katexRender';
import WhiteboardSheet from './WhiteboardSheet';

const QUICK_PROMPTS = [
  "🎙️ Hablar por micrófono",
  "📷 Adjuntar foto de mi ejercicio",
  "🏎️ Un auto pasa de 10 m/s a 30 m/s en 4 s. ¿Aceleración y distancia?",
  "🚗 Un vehículo viaja a 20 m/s constante durante 8 segundos. ¿Distancia?",
  "🔀 Dos autos a 500 m se mueven a 20 m/s y 30 m/s. ¿Tiempo de encuentro?"
];

export default function AntoChat({ apiKey }) {
  const [messages, setMessages] = useState([
    {
      sender: 'anto',
      text: '¡Hola! Soy Anto 🫶, tu tutora de física especialista en MRU y MRUV. ¡Puedes hablarme por micrófono 🎙️, escribirme o subir una foto 📷 de tu libro u hoja! Escanearé el texto exacto de tu foto para que no haya ningún error con tus datos.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [photoData, setPhotoData] = useState({ v0: '', vf: '', d: '', t: '', a: '' });
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Inicializar Web Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('Error de micrófono:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta entrada de micrófono directamente. Puedes escribir o usar la entrada de texto 🎙️');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una foto o imagen (PNG, JPG).');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imgDataUrl = event.target.result;
        setSelectedImage(imgDataUrl);
        setIsOcrScanning(true);
        setOcrText('');
        setPhotoData({ v0: '', vf: '', d: '', t: '', a: '' });

        // Escanear texto con OCR
        const scanned = await scanImageText(imgDataUrl);
        setOcrText(scanned);
        setIsOcrScanning(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setOcrText('');
    setPhotoData({ v0: '', vf: '', d: '', t: '', a: '' });
    setIsOcrScanning(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if ((!query.trim() && !selectedImage && !ocrText.trim() && !Object.values(photoData).some(Boolean)) || loading) return;

    if (query === "📷 Adjuntar foto de mi ejercicio") {
      fileInputRef.current?.click();
      return;
    }

    if (query === "🎙️ Hablar por micrófono") {
      toggleRecording();
      return;
    }

    const currentImage = selectedImage;
    const currentOcrText = ocrText;
    const currentPhotoData = { ...photoData };

    setSelectedImage(null);
    setOcrText('');
    setPhotoData({ v0: '', vf: '', d: '', t: '', a: '' });
    setIsOcrScanning(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Construir string explícito de datos confirmados por el usuario
    const confirmArr = [];
    if (currentPhotoData.v0) confirmArr.push(`Velocidad inicial v0 = ${currentPhotoData.v0} m/s`);
    if (currentPhotoData.vf) confirmArr.push(`Velocidad final vf = ${currentPhotoData.vf} m/s`);
    if (currentPhotoData.d) confirmArr.push(`Distancia d = ${currentPhotoData.d} m`);
    if (currentPhotoData.t) confirmArr.push(`Tiempo t = ${currentPhotoData.t} s`);
    if (currentPhotoData.a) confirmArr.push(`Aceleración a = ${currentPhotoData.a} m/s²`);
    
    const confirmedDataStr = confirmArr.length ? `[DATOS CONFIRMADOS DE LA FOTO]: ${confirmArr.join(', ')}` : '';

    const fullPromptForUserMsg = [query, confirmedDataStr, currentOcrText ? `(Texto foto: "${currentOcrText}")` : '']
      .filter(Boolean)
      .join(' | ');

    const userMsg = {
      sender: 'user',
      text: fullPromptForUserMsg || 'Análisis de foto de física',
      image: currentImage,
      ocrText: currentOcrText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      if (apiKey) {
        const combinedPrompt = [query, confirmedDataStr, currentOcrText ? `(Texto transcrito de la foto: "${currentOcrText}")` : '']
          .filter(Boolean)
          .join('\n');

        const geminiResponse = await askGeminiAnto(combinedPrompt, apiKey, currentImage);
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
        await new Promise((resolve) => setTimeout(resolve, 650));

        let solution;
        const combinedQueryText = [query, confirmedDataStr, currentOcrText].filter(Boolean).join(' ');

        if (currentImage) {
          solution = analyzeImageProblem(currentImage, combinedQueryText, currentOcrText);
        } else {
          solution = solvePhysicsProblem(combinedQueryText);
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'anto',
            solution: solution,
            userQuery: combinedQueryText,
            text: solution.isConceptual
              ? solution.explicacion
              : `¡He resuelto tu ejercicio en la hoja de cuaderno virtual! 📝 Arriba tienes el desglose matemático detallado con los datos exactos y a continuación te lo explico por escrito:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'anto',
          text: `Ups, ocurrió un detalle: ${error.message}. ¡Reinténtalo o revisa tu API Key! 🫶`,
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
                {/* Foto adjunta */}
                {msg.image && (
                  <div style={{ marginBottom: '0.75rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    <img src={msg.image} alt="Foto del ejercicio adjuntada" style={{ maxWidth: '100%', maxHeight: '250px', display: 'block', objectFit: 'contain', background: '#020617' }} />
                  </div>
                )}

                {/* 1. HOJA EN BLANCO VIRTUAL / CUADERNO DE RESOLUCIÓN (Renderizada Primero) */}
                {msg.solution && !msg.solution.isConceptual && (
                  <WhiteboardSheet solution={msg.solution} userText={msg.userQuery} />
                )}

                {/* 2. EXPLICACIÓN ESCRITA DE ANTO EN EL CHAT */}
                {msg.text && (
                  <div style={{ whiteSpace: 'pre-line', marginTop: msg.solution && !msg.solution.isConceptual ? '0.75rem' : 0 }}>
                    {msg.text}
                  </div>
                )}

                {/* Detalle adicional de solución si es conceptual */}
                {msg.solution && msg.solution.isConceptual && (
                  <div className="solution-card">
                    <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>{msg.solution.title}</h4>
                    {msg.solution.formula && (
                      <div
                        className="formula-box"
                        dangerouslySetInnerHTML={{ __html: renderBlockLatex(msg.solution.formula) }}
                      />
                    )}
                    {msg.solution.tip && (
                      <div className="anto-tip-box">
                        <Lightbulb size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div><strong>Tip de Anto 🫶: </strong>{msg.solution.tip}</div>
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
                <span>Anto 🫶 está resolviendo tu ejercicio en la hoja en blanco virtual...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar con Micrófono 🎙️ y Cámara 📷 */}
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

          {/* Estado de grabación por micrófono */}
          {isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '0.4rem 0.85rem', borderRadius: '10px', fontSize: '0.82rem', border: '1px solid #ef4444' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse-red 1s infinite' }}></span>
              <strong>Escuchando tu voz... Habla tu ejercicio de física 🎙️</strong>
            </div>
          )}

          {/* Miniatura de Imagen Seleccionada + OCR Editor */}
          {selectedImage && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(168, 85, 247, 0.12)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--accent-purple)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={selectedImage} alt="Vista previa" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1, fontSize: '0.82rem', color: '#fff' }}>
                  <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {isOcrScanning ? (
                      <>
                        <RefreshCw size={14} className="spin-icon" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-cyan)' }} />
                        <span>Escaneando números y texto de tu foto (OCR)...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} color="#4ade80" />
                        <span>Foto procesada • Revisa los datos detectados abajo</span>
                      </>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Anto usará estos datos exactos para resolver tu ejercicio.
                  </span>
                </div>
                <button className="btn-secondary" style={{ padding: '0.35rem' }} onClick={removeSelectedImage} title="Quitar foto">
                  <X size={16} />
                </button>
              </div>

              {/* Caja de edición de texto extraído por OCR y campos numéricos */}
              {!isOcrScanning && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '500' }}>
                    <Edit3 size={13} />
                    <span>Texto / Datos detectados (puedes corregir si algo se leyó mal):</span>
                  </div>
                  <textarea
                    rows={2}
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    placeholder="Ej. Un auto va a 20 m/s y frena en 4 s..."
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.82rem',
                      padding: '0.4rem 0.6rem',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />

                  {/* Formulario rápido de confirmación de números */}
                  <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '0.2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '600', marginBottom: '0.4rem' }}>
                      📋 Ingresa o confirma los valores de tu foto (para garantizar resolución 100% exacta):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>v₀ (m/s o km/h)</label>
                        <input
                          type="number"
                          placeholder="Ej. 10"
                          value={photoData.v0}
                          onChange={(e) => setPhotoData({ ...photoData, v0: e.target.value })}
                          style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.78rem', padding: '0.25rem 0.4rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>v_f (m/s)</label>
                        <input
                          type="number"
                          placeholder="Ej. 30"
                          value={photoData.vf}
                          onChange={(e) => setPhotoData({ ...photoData, vf: e.target.value })}
                          style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.78rem', padding: '0.25rem 0.4rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Distancia d (m)</label>
                        <input
                          type="number"
                          placeholder="Ej. 100"
                          value={photoData.d}
                          onChange={(e) => setPhotoData({ ...photoData, d: e.target.value })}
                          style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.78rem', padding: '0.25rem 0.4rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Tiempo t (s)</label>
                        <input
                          type="number"
                          placeholder="Ej. 4"
                          value={photoData.t}
                          onChange={(e) => setPhotoData({ ...photoData, t: e.target.value })}
                          style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.78rem', padding: '0.25rem 0.4rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Aceleración a</label>
                        <input
                          type="number"
                          placeholder="Ej. 2"
                          value={photoData.a}
                          onChange={(e) => setPhotoData({ ...photoData, a: e.target.value })}
                          style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.78rem', padding: '0.25rem 0.4rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="input-box-wrapper">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />

            {/* Botón de Micrófono 🎙️ */}
            <button
              className={`btn-secondary ${isRecording ? 'mic-btn-recording' : ''}`}
              style={{ padding: '0.4rem 0.6rem', border: 'none', background: 'transparent' }}
              onClick={toggleRecording}
              title={isRecording ? "Detener grabación" : "Hablarle a Anto por micrófono"}
            >
              {isRecording ? <MicOff size={20} color="#ef4444" /> : <Mic size={20} color="var(--accent-purple)" />}
            </button>

            {/* Botón de Cámara 📷 */}
            <button
              className="btn-secondary"
              style={{ padding: '0.4rem 0.6rem', border: 'none', background: 'transparent' }}
              onClick={() => fileInputRef.current?.click()}
              title="Subir foto de un ejercicio"
            >
              <Camera size={20} color="var(--accent-cyan)" />
            </button>

            <input
              type="text"
              className="chat-input"
              placeholder={isRecording ? "Escuchando... habla tu ejercicio..." : "Habla por micrófono, escribe o sube una foto..."}
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

      {/* Sidebar Anto Bio */}
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
            <div className="stat-val">🎙️ Voz</div>
            <div className="stat-lbl">Entrada por Micrófono</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">📝 Hoja</div>
            <div className="stat-lbl">Resolución en Blanco</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Mic size={16} /> Entradas Disponibles
          </h4>
          <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', lineHeight: '1.7' }}>
            <li>🎙️ <strong>Dictado por Micrófono</strong></li>
            <li>📷 <strong>Escaneo de Foto de Ejercicio</strong></li>
            <li>📝 <strong>Resolución en Hoja de Cuaderno</strong></li>
            <li>✍️ <strong>Explicación Escrita en Chat</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
