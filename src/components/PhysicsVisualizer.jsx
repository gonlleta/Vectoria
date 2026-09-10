import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, Eye, Zap, Layers } from 'lucide-react';

export default function PhysicsVisualizer() {
  const [mode, setMode] = useState('mru'); // 'mru', 'caida', 'vectors'

  // Parametros de simulación
  const [v0, setV0] = useState(20);
  const [acc, setAcc] = useState(2);
  const [gravity, setGravity] = useState(9.8);
  const [mass, setMass] = useState(10);
  const [appliedForce, setAppliedForce] = useState(50);
  const [frictionCoef, setFrictionCoef] = useState(0.2);

  // Control de animación
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Reiniciar animación
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  // Loop de simulación 60 FPS
  useEffect(() => {
    const animate = (now) => {
      if (lastTimeRef.current != null && isRunning) {
        const delta = (now - lastTimeRef.current) / 1000;
        setTime((prev) => prev + delta);
      }
      lastTimeRef.current = now;
      if (isRunning) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = null;
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);

  // Dibujo en Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Fondo grid cibernético
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (mode === 'mru') {
      drawMRUSimulation(ctx, width, height, time, v0, acc);
    } else if (mode === 'caida') {
      drawCaidaSimulation(ctx, width, height, time, v0, gravity);
    } else if (mode === 'vectors') {
      drawVectorSimulation(ctx, width, height, mass, appliedForce, frictionCoef);
    }
  }, [mode, time, v0, acc, gravity, mass, appliedForce, frictionCoef]);

  // 1. Dibujar Simulación MRU / MRUV
  const drawMRUSimulation = (ctx, width, height, t, v0Val, aVal) => {
    const trackY = height - 100;

    // Pista de carreras
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, trackY, width, 80);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, trackY);
    ctx.lineTo(width, trackY);
    ctx.stroke();

    // Líneas divisoras de pista
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, trackY + 40);
    ctx.lineTo(width, trackY + 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cálculo de posición x(t) = v0*t + 0.5*a*t^2
    const currentV = v0Val + aVal * t;
    const posX = (v0Val * t + 0.5 * aVal * t * t) * 8 % (width - 120) + 40;
    const carY = trackY - 24;

    // Autos 2D Stylized
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.roundRect(posX, carY, 60, 24, 8);
    ctx.fill();

    // Ruedas
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(posX + 14, carY + 24, 7, 0, Math.PI * 2);
    ctx.arc(posX + 46, carY + 24, 7, 0, Math.PI * 2);
    ctx.fill();

    // Vector Velocidad (Cian)
    ctx.strokeStyle = '#06b6d4';
    ctx.fillStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(posX + 60, carY + 12);
    ctx.lineTo(posX + 60 + Math.min(currentV * 2, 90), carY + 12);
    ctx.stroke();

    // Flecha de vector
    ctx.beginPath();
    ctx.moveTo(posX + 60 + Math.min(currentV * 2, 90), carY + 7);
    ctx.lineTo(posX + 68 + Math.min(currentV * 2, 90), carY + 12);
    ctx.lineTo(posX + 60 + Math.min(currentV * 2, 90), carY + 17);
    ctx.fill();

    // Telemetría en tiempo real
    ctx.fillStyle = '#fff';
    ctx.font = '600 14px "Plus Jakarta Sans"';
    ctx.fillText(`Tiempo (t): ${t.toFixed(2)} s`, 20, 35);
    ctx.fillText(`Velocidad (v): ${currentV.toFixed(2)} m/s`, 20, 60);
    ctx.fillText(`Aceleración (a): ${aVal.toFixed(2)} m/s²`, 20, 85);
  };

  // 2. Dibujar Caída Libre / Tiro Vertical
  const drawCaidaSimulation = (ctx, width, height, t, v0Val, gVal) => {
    const groundY = height - 50;
    const startY = 80;
    const maxDropHeight = groundY - startY;

    // Suelo
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, groundY, width, 50);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Cálculo de posición y(t) = v0*t - 0.5*g*t^2
    const deltaY = (v0Val * t - 0.5 * gVal * t * t) * 6;
    let ballY = groundY - 25 - deltaY;

    // Rebote / choque con suelo
    if (ballY >= groundY - 25) {
      ballY = groundY - 25;
    }

    const currentV = v0Val - gVal * t;

    // Balón 2D
    const ballX = width / 2;
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ballX, ballY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Vector Gravedad g (Verde)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ballX, ballY);
    ctx.lineTo(ballX, ballY + 45);
    ctx.stroke();

    // Telemetría
    ctx.fillStyle = '#fff';
    ctx.font = '600 14px "Plus Jakarta Sans"';
    ctx.fillText(`Gravedad (g): ${gVal} m/s²`, 20, 35);
    ctx.fillText(`Tiempo (t): ${t.toFixed(2)} s`, 20, 60);
    ctx.fillText(`Velocidad instantánea: ${currentV.toFixed(2)} m/s`, 20, 85);
  };

  // 3. Dibujar Diagrama de Cuerpo Libre (DCL)
  const drawVectorSimulation = (ctx, width, height, mVal, FVal, muVal) => {
    const centerX = width / 2;
    const centerY = height / 2 + 20;

    // Bloque central
    const bWidth = 120;
    const bHeight = 80;
    const blockX = centerX - bWidth / 2;
    const blockY = centerY - bHeight / 2;

    // Suelo
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(50, centerY + bHeight / 2, width - 100, 20);

    // Bloque
    ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(blockX, blockY, bWidth, bHeight, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(`m = ${mVal} kg`, centerX, centerY + 5);

    // 1. Peso P = m*g (Hacia abajo - Rosa)
    const P = mVal * 9.8;
    drawArrow(ctx, centerX, centerY, centerX, centerY + 110, '#ec4899', `P = ${P.toFixed(0)} N`);

    // 2. Normal N = P (Hacia arriba - Cian)
    drawArrow(ctx, centerX, centerY, centerX, centerY - 110, '#06b6d4', `N = ${P.toFixed(0)} N`);

    // 3. Fuerza Aplicada F (Hacia la derecha - Ámbar)
    drawArrow(ctx, centerX, centerY, centerX + Math.min(FVal * 1.8, 140), centerY, '#f59e0b', `F = ${FVal} N`);

    // 4. Fuerza de Rozamiento f_r = mu * N (Hacia la izquierda - Esmeralda)
    const fr = muVal * P;
    drawArrow(ctx, centerX, centerY, centerX - Math.min(fr * 1.8, 120), centerY, '#10b981', `f_r = ${fr.toFixed(1)} N`);

    ctx.textAlign = 'left';
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY, color, label) => {
    const headlen = 12;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.fill();

    ctx.font = '600 13px "Plus Jakarta Sans"';
    ctx.fillText(label, toX + 8, toY - 8);
  };

  return (
    <div className="sim-container">
      {/* Canvas Principal */}
      <div className="glass-panel canvas-wrapper">
        <canvas ref={canvasRef} width={760} height={480} />

        {/* Overlay de Controles */}
        <div className="canvas-overlay-controls">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'Pausar' : 'Iniciar Simulación'}
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              onClick={handleReset}
            >
              <RotateCcw size={16} /> Reiniciar
            </button>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Tiempo simulado: <span style={{ color: '#fff', fontWeight: 700 }}>{time.toFixed(2)} s</span>
          </div>
        </div>
      </div>

      {/* Sidebar de Configuración de la Simulación */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} color="var(--accent-cyan)" />
          Modos de Simulación 2D
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            className={`topic-btn ${mode === 'mru' ? 'active' : ''}`}
            onClick={() => { setMode('mru'); handleReset(); }}
          >
            🏎️ Movimiento Rectilíneo (MRU/MRUV)
          </button>
          <button
            className={`topic-btn ${mode === 'caida' ? 'active' : ''}`}
            onClick={() => { setMode('caida'); handleReset(); }}
          >
            🍎 Caída Libre y Gravedad
          </button>
          <button
            className={`topic-btn ${mode === 'vectors' ? 'active' : ''}`}
            onClick={() => { setMode('vectors'); handleReset(); }}
          >
            📦 Diagrama de Cuerpo Libre (DCL)
          </button>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', marginBottom: '0.85rem' }}>
            Parámetros en Tiempo Real
          </h4>

          {mode === 'mru' && (
            <div className="inputs-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="input-field-group">
                <label>Velocidad Inicial (v₀): {v0} m/s</label>
                <input type="range" min="0" max="50" value={v0} onChange={(e) => setV0(Number(e.target.value))} />
              </div>
              <div className="input-field-group">
                <label>Aceleración (a): {acc} m/s²</label>
                <input type="range" min="-5" max="10" value={acc} onChange={(e) => setAcc(Number(e.target.value))} />
              </div>
            </div>
          )}

          {mode === 'caida' && (
            <div className="inputs-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="input-field-group">
                <label>Aceleración de Gravedad: {gravity} m/s²</label>
                <select
                  style={{ background: '#020617', color: '#fff', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                  value={gravity}
                  onChange={(e) => setGravity(Number(e.target.value))}
                >
                  <option value={9.8}>🌎 Tierra (9.8 m/s²)</option>
                  <option value={1.62}>🌕 Luna (1.62 m/s²)</option>
                  <option value={3.72}>🔴 Marte (3.72 m/s²)</option>
                  <option value={24.79}>🪐 Júpiter (24.79 m/s²)</option>
                </select>
              </div>
            </div>
          )}

          {mode === 'vectors' && (
            <div className="inputs-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="input-field-group">
                <label>Masa (m): {mass} kg</label>
                <input type="range" min="1" max="50" value={mass} onChange={(e) => setMass(Number(e.target.value))} />
              </div>
              <div className="input-field-group">
                <label>Fuerza Aplicada (F): {appliedForce} N</label>
                <input type="range" min="0" max="200" value={appliedForce} onChange={(e) => setAppliedForce(Number(e.target.value))} />
              </div>
              <div className="input-field-group">
                <label>Coeficiente de Fricción (μ): {frictionCoef}</label>
                <input type="range" min="0" max="1" step="0.05" value={frictionCoef} onChange={(e) => setFrictionCoef(Number(e.target.value))} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
