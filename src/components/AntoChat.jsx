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
      text: '¡Hola! Soy Anto 🫶, tu tutora de física especialista en MRU y MRUV. ¡Puedes hablarme por micrófono 🎙️, escribirme o subir una foto 📷 de tu libro u hoja! Leeré los datos directamente de tu imagen y resolveré tu ejercicio paso a paso.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [photoContext, setPhotoContext] = useState(null); // Contexto activo de foto para cambio de ejercicios
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
        // Procesar y enviar la foto al chat inmediatamente sin necesidad de clics extra
        await processAndSendPhoto(imgDataUrl, input);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setOcrText('');
    setIsOcrScanning(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Función principal para enviar y procesar fotos instantáneamente
  const processAndSendPhoto = async (imgDataUrl, textQuery = '') => {
    if (!imgDataUrl || loading) return;

    // Limpiar input y selecciones
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSelectedImage(null);
    setInput('');
    setLoading(true);

    // 1. Mostrar mensaje del usuario con la foto en el chat de inmediato
    const userMsg = {
      sender: 'user',
      text: textQuery.trim() || '📷 Foto de ejercicio enviada para análisis',
      image: imgDataUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      // 2. Escanear texto con OCR local (con timeout de 3.5 segundos para jamás trabar la interfaz)
      let scannedText = '';
      try {
        const ocrPromise = scanImageText(imgDataUrl);
        const timeoutPromise = new Promise((res) => setTimeout(() => res(''), 3500));
        scannedText = await Promise.race([ocrPromise, timeoutPromise]);
      } catch (e) {
        console.warn('OCR error/timeout:', e);
      }

      // 3. Detectar si hay múltiples ejercicios en la foto
      const multiExercises = detectMultipleExercises(scannedText || textQuery);

      const newPhotoCtx = {
        image: imgDataUrl,
        ocrText: scannedText,
        multiExercises: multiExercises.length ? multiExercises : [{ id: '1', title: 'Ejercicio 1', text: scannedText }],
        activeIndex: 0
      };
      setPhotoContext(newPhotoCtx);

      // 4. Obtener solución (con API de Gemini o Motor Físico Local)
      if (apiKey) {
        const geminiPrompt = [textQuery, scannedText ? `(Texto transcrito de la foto: "${scannedText}")` : '']
          .filter(Boolean)
          .join('\n');

        const geminiResponse = await askGeminiAnto(geminiPrompt, apiKey, imgDataUrl);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'anto',
            text: geminiResponse,
            isGemini: true,
            photoCtx: newPhotoCtx,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const combinedText = [textQuery, scannedText].filter(Boolean).join(' ');
        const solution = analyzeImageProblem(imgDataUrl, combinedText, scannedText, 0);

        setMessages((prev) => [
          ...prev,
          {
            sender: 'anto',
            solution: solution,
            userQuery: combinedText || 'Análisis de foto de física',
            photoCtx: newPhotoCtx,
            text: solution.isConceptual
              ? solution.explicacion
              : `¡He analizado tu foto y resuelto tu ejercicio en la hoja de cuaderno virtual! 📝`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'anto',
          text: `⚠️ No pude procesar tu foto: ${error.message}. ¡Prueba con otra foto más clara o escríbeme el ejercicio en el chat! 🫶`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Resolver ejercicio específico o siguiente de la foto
  const handleSolveExerciseIndex = async (targetIndex, customContext = null) => {
    const activeCtx = customContext || photoContext;
    if (!activeCtx || !activeCtx.multiExercises || activeCtx.multiExercises.length === 0) return;

    if (targetIndex >= activeCtx.multiExercises.length) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'anto',
          text: '🏆 ¡Ya hemos resuelto todos los ejercicios que detecté en tu foto! Si tienes otra hoja o guía, ¡sube la foto y la resolvemos de inmediato! 🫶',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    const ex = activeCtx.multiExercises[targetIndex];
    const updatedCtx = { ...activeCtx, activeIndex: targetIndex };
    setPhotoContext(updatedCtx);

    const userPrompt = `Pasar a resolver el ${ex.title}: "${ex.text}"`;

    const userMsg = {
      sender: 'user',
      text: userPrompt,
      image: activeCtx.image,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      if (apiKey) {
        const geminiPrompt = `[SOLICITUD DE RESOLUCIÓN DE EJERCICIO SIGUIENTE DE FOTO ADJUNTA]\nPor favor resuelve el ${ex.title} (Ejercicio ${targetIndex + 1} de ${activeCtx.multiExercises.length}): "${ex.text}"\nMuestra los datos exactos, la fórmula y la solución paso a paso.`;
        const geminiResponse = await askGeminiAnto(geminiPrompt, apiKey, activeCtx.image);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'anto',
            text: geminiResponse,
            isGemini: true,
            photoCtx: updatedCtx,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const solution = analyzeImageProblem(activeCtx.image, ex.text, activeCtx.ocrText, targetIndex);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'anto',
            solution: solution,
            userQuery: userPrompt,
            photoCtx: updatedCtx,
            text: `¡Aquí tienes la resolución del ${ex.title} de tu foto! 📝 (Ejercicio ${targetIndex + 1} de ${activeCtx.multiExercises.length}):`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'anto',
          text: `Ups, no pude resolver el ${ex.title}: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    const lowerQuery = (query || '').toLowerCase().trim();

    if (selectedImage) {
      await processAndSendPhoto(selectedImage, query);
      return;
    }

    // 1. Detectar si el usuario pide pasar al siguiente ejercicio de una foto activa
    const isNextExerciseRequest = photoContext && (
      lowerQuery.includes('siguiente') ||
      lowerQuery.includes('proximo') ||
      lowerQuery.includes('próximo') ||
      lowerQuery.includes('el que sigue') ||
      lowerQuery.includes('paso al') ||
      lowerQuery.includes('pasa al') ||
      /^(siguiente|proximo|próximo|next)$/i.test(lowerQuery) ||
      /ejercicio\s*(\d+|[a-d])/i.test(lowerQuery) ||
      /resuelve\s*(el|el ejercicio)?\s*(\d+|[a-d])/i.test(lowerQuery)
    );

    if (isNextExerciseRequest) {
      let targetIdx = photoContext.activeIndex + 1;

      // Si el usuario especificó un número o letra explícita
      const matchNum = lowerQuery.match(/(?:ejercicio|el)\s*(\d+)/i);
      if (matchNum) {
        const numVal = parseInt(matchNum[1], 10);
        if (numVal >= 1 && numVal <= photoContext.multiExercises.length) {
          targetIdx = numVal - 1;
        }
      } else {
        const matchLetter = lowerQuery.match(/(?:ejercicio|el)\s*([a-d])/i);
        if (matchLetter) {
          const letterMap = { a: 0, b: 1, c: 2, d: 3 };
          if (letterMap[matchLetter[1].toLowerCase()] !== undefined) {
            targetIdx = letterMap[matchLetter[1].toLowerCase()];
          }
        }
      }

      setInput('');
      await handleSolveExerciseIndex(targetIdx);
      return;
    }

    if (!query.trim() || loading) return;

    if (query === "📷 Adjuntar foto de mi ejercicio") {
      fileInputRef.current?.click();
      return;
    }

    if (query === "🎙️ Hablar por micrófono") {
      toggleRecording();
      return;
    }

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (apiKey) {
        const geminiResponse = await askGeminiAnto(query, apiKey);
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
        await new Promise((resolve) => setTimeout(resolve, 550));
        const solution = solvePhysicsProblem(query);

        setMessages((prev) => [
          ...prev,
          {
            sender: 'anto',
            solution: solution,
            userQuery: query,
            text: solution.isConceptual
              ? solution.explicacion
              : `¡He resuelto tu ejercicio en la hoja de cuaderno virtual! 📝 Arriba tienes el desglose matemático detallado y a continuación te lo explico por escrito:`,
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

                {/* 3. BARRA NAVEGACIÓN MULTI-EJERCICIOS EN LA FOTO */}
                {msg.photoCtx && msg.photoCtx.multiExercises && msg.photoCtx.multiExercises.length > 1 && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.6rem', borderTop: '1px dashed rgba(255, 255, 255, 0.15)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: '600', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={14} />
                      <span>Ejercicios detectados en esta foto ({msg.photoCtx.multiExercises.length}):</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {msg.photoCtx.multiExercises.map((exItem, exIdx) => {
                        const isCurrent = msg.photoCtx.activeIndex === exIdx;
                        return (
                          <button
                            key={exIdx}
                            onClick={() => handleSolveExerciseIndex(exIdx, msg.photoCtx)}
                            style={{
                              background: isCurrent ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.08)',
                              color: '#fff',
                              border: isCurrent ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '20px',
                              padding: '0.25rem 0.65rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontWeight: isCurrent ? '600' : 'normal',
                              boxShadow: isCurrent ? '0 0 10px rgba(168, 85, 247, 0.4)' : 'none'
                            }}
                          >
                            <span>{isCurrent ? '📌' : '➡️'} {exItem.title}</span>
                          </button>
                        );
                      })}
                      {msg.photoCtx.activeIndex < msg.photoCtx.multiExercises.length - 1 && (
                        <button
                          onClick={() => handleSolveExerciseIndex(msg.photoCtx.activeIndex + 1, msg.photoCtx)}
                          style={{
                            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: '600'
                          }}
                        >
                          <span>▶️ Resolver Siguiente</span>
                        </button>
                      )}
                    </div>
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

          {/* Miniatura de Imagen Seleccionada */}
          {selectedImage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(168, 85, 247, 0.15)', padding: '0.6rem 0.85rem', borderRadius: '12px', border: '1px solid var(--accent-purple)' }}>
              <img src={selectedImage} alt="Vista previa" style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
              <div style={{ flex: 1, fontSize: '0.82rem', color: '#fff' }}>
                <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {isOcrScanning ? (
                    <>
                      <RefreshCw size={14} className="spin-icon" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-cyan)' }} />
                      <span>Analizando y leyendo datos de la foto...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} color="#4ade80" />
                      <span>Foto lista • Anto la leerá directamente</span>
                    </>
                  )}
                </div>
                {ocrText && !isOcrScanning && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
                    Leído: "{ocrText}"
                  </span>
                )}
              </div>
              <button className="btn-secondary" style={{ padding: '0.25rem' }} onClick={removeSelectedImage} title="Quitar foto">
                <X size={16} />
              </button>
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
