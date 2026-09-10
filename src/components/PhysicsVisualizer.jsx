import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Layers } from 'lucide-react';

export default function PhysicsVisualizer() {
  const [mode, setMode] = useState('mru'); // 'mru', 'frenado', 'encuentro'

  // Parametros de simulación
  const [v0, setV0] = useState(20);
  const [acc, setAcc] = useState(2);
  const [v1, setV1] = useState(25);
  const [v2, setV2] = useState(35);
  const [distInicial, setDistInicial] = useState(600);

  // Control de animación
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

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
      drawMRUMotion(ctx, width, height, time, v0, acc);
    } else if (mode === 'frenado') {
      drawFrenadoMotion(ctx, width, height, time, v0, Math.abs(acc));
    } else if (mode === 'encuentro') {
      drawEncuentroMotion(ctx, width, height, time, v1, v2, distInicial);
    }
  }, [mode, time, v0, acc, v1, v2, distInicial]);

  // 1. Simulación de MRU y MRUV
  const drawMRUMotion = (ctx, width, height, t, v0Val, aVal) => {
    const trackY = height - 120;

    // Pista
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, trackY, width, 80);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, trackY);
    ctx.lineTo(width, trackY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, trackY + 40);
    ctx.lineTo(width, trackY + 40);
    ctx.stroke();
    ctx.setLineDash([]);

    const currentV = v0Val + aVal * t;
    const distReal = v0Val * t + 0.5 * aVal * t * t;
    const posX = (distReal * 6) % (width - 100) + 30;
    const carY = trackY - 24;

    // Auto deportivo en MRUV
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

    // Vector Velocidad
    drawVectorArrow(ctx, posX + 60, carY + 12, posX + 60 + Math.min(currentV * 2, 100), carY + 12, '#06b6d4', `v = ${currentV.toFixed(1)} m/s`);

    // Telemetría
    ctx.fillStyle = '#fff';
    ctx.font = '600 14px "Plus Jakarta Sans"';
    ctx.fillText(`Tiempo (t): ${t.toFixed(2)} s`, 20, 35);
    ctx.fillText(`Velocidad (v): ${currentV.toFixed(2)} m/s (${(currentV * 3.6).toFixed(1)} km/h)`, 20, 60);
    ctx.fillText(`Aceleración (a): ${aVal.toFixed(2)} m/s²`, 20, 85);
    ctx.fillText(`Distancia recorrida (d): ${distReal.toFixed(2)} m`, 20, 110);
  };

  // 2. Simulación de Frenado
  const drawFrenadoMotion = (ctx, width, height, t, desaceleracion) => {
    const trackY = height - 120;
    const vInit = 30;
    const tFrenado = vInit / desaceleracion;

    let currentV = vInit - desaceleracion * t;
    let distReal = vInit * t - 0.5 * desaceleracion * t * t;

    if (t >= tFrenado) {
      currentV = 0;
      distReal = vInit * tFrenado - 0.5 * desaceleracion * tFrenado * tFrenado;
    }

    // Pista
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, trackY, width, 80);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, trackY);
    ctx.lineTo(width, trackY);
    ctx.stroke();

    const posX = Math.min((distReal * 5) + 40, width - 100);
    const carY = trackY - 24;

    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.roundRect(posX, carY, 60, 24, 8);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(posX + 14, carY + 24, 7, 0, Math.PI * 2);
    ctx.arc(posX + 46, carY + 24, 7, 0, Math.PI * 2);
    ctx.fill();

    // Vector Desaceleración (Hacia atrás en rojo)
    if (currentV > 0) {
      drawVectorArrow(ctx, posX, carY + 12, posX - 45, carY + 12, '#ef4444', `a = -${desaceleracion} m/s²`);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '600 14px "Plus Jakarta Sans"';
    ctx.fillText(`Velocidad inicial (v₀): ${vInit} m/s`, 20, 35);
    ctx.fillText(`Desaceleración (a): -${desaceleracion} m/s²`, 20, 60);
    ctx.fillText(`Velocidad actual: ${currentV.toFixed(2)} m/s`, 20, 85);
    ctx.fillText(`Distancia de frenado (d): ${distReal.toFixed(2)} m`, 20, 110);
  };

  // 3. Simulación de Encuentro de Móviles
  const drawEncuentroMotion = (ctx, width, height, t, v1Val, v2Val, distTotal) => {
    const trackY = height - 120;
    const te = distTotal / (v1Val + v2Val);

    let tActual = Math.min(t, te);
    let posX1 = (v1Val * tActual / distTotal) * (width - 160) + 40;
    let posX2 = (width - 120) - (v2Val * tActual / distTotal) * (width - 160);

    // Pista
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, trackY, width, 80);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, trackY);
    ctx.lineTo(width, trackY);
    ctx.stroke();

    const carY = trackY - 24;

    // Auto 1 (Púrpura)
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.roundRect(posX1, carY, 55, 22, 6);
    ctx.fill();

    // Auto 2 (Cian)
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.roundRect(posX2, carY, 55, 22, 6);
    ctx.fill();

    // Icono de choque / encuentro si se cruzan
    if (t >= te) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 28px Outfit';
      ctx.fillText('💥 ¡Punto de Encuentro!', width / 2 - 140, carY - 20);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '600 14px "Plus Jakarta Sans"';
    ctx.fillText(`Distancia entre autos (D): ${distTotal} m`, 20, 35);
    ctx.fillText(`Auto 1 (Morado): v₁ = ${v1Val} m/s`, 20, 60);
    ctx.fillText(`Auto 2 (Cian): v₂ = ${v2Val} m/s`, 20, 85);
    ctx.fillText(`Tiempo de encuentro calculado: ${te.toFixed(2)} s`, 20, 110);
  };

  const drawVectorArrow = (ctx, fromX, fromY, toX, toY, color, label) => {
    const headlen = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.fill();

    ctx.font = '600 12px "Plus Jakarta Sans"';
    ctx.fillText(label, toX + 5, toY - 5);
  };

  return (
    <div className="sim-container">
      {/* Canvas Principal */}
      <div className="glass-panel canvas-wrapper">
        <canvas ref={canvasRef} width={760} height={480} />

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

      {/* Sidebar de Modos MRU / MRUV */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} color="var(--accent-cyan)" />
          Simuladores MRU & MRUV
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            className={`topic-btn ${mode === 'mru' ? 'active' : ''}`}
            onClick={() => { setMode('mru'); handleReset(); }}
          >
            🏎️ Movimiento Acelerado (MRUV)
          </button>
          <button
            className={`topic-btn ${mode === 'frenado' ? 'active' : ''}`}
            onClick={() => { setMode('frenado'); handleReset(); }}
          >
            🛑 Frenado y Desaceleración
          </button>
          <button
            className={`topic-btn ${mode === 'encuentro' ? 'active' : ''}`}
            onClick={() => { setMode('encuentro'); handleReset(); }}
          >
            🔀 Encuentro de 2 Móviles (MRU)
          </button>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', marginBottom: '0.85rem' }}>
            Parámetros Editables
          </h4>

          {mode === 'mru' && (
            <div className="inputs-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="input-field-group">
                <label>Velocidad Inicial (v₀): {v0} m/s</label>
                <input type="range" min="0" max="50" value={v0} onChange={(e) => setV0(Number(e.target.value))} />
              </div>
              <div className="input-field-group">
                <label>Aceleración (a): {acc} m/s²</label>
                <input type="range" min="0" max="10" value={acc} onChange={(e) => setAcc(Number(e.target.value))} />
              </div>
            </div>
          )}

          {mode === 'frenado' && (
            <div className="inputs-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="input-field-group">
                <label>Velocidad Inicial (v₀): {v0} m/s</label>
                <input type="range" min="10" max="60" value={v0} onChange={(e) => setV0(Number(e.target.value))} />
              </div>
              <div className="input-field-group">
                <label>Tasa de Frenado (-a): {acc} m/s²</label>
                <input type="range" min="1" max="10" value={acc} onChange={(e) => setAcc(Number(e.target.value))} />
              </div>
            </div>
          )}

          {mode === 'encuentro' && (
            <div className="inputs-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="input-field-group">
                <label>Velocidad Auto 1: {v1} m/s</label>
                <input type="range" min="5" max="50" value={v1} onChange={(e) => setV1(Number(e.target.value))} />
              </div>
              <div className="input-field-group">
                <label>Velocidad Auto 2: {v2} m/s</label>
                <input type="range" min="5" max="50" value={v2} onChange={(e) => setV2(Number(e.target.value))} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
