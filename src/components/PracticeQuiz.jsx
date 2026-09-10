import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { renderBlockLatex } from '../utils/katexRender';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Si un vehículo parte del reposo y alcanza una velocidad de 20 m/s en 4 segundos, ¿cuál es su aceleración constante?',
    options: [
      { text: '5 m/s²', correct: true },
      { text: '80 m/s²', correct: false },
      { text: '4 m/s²', correct: false },
      { text: '10 m/s²', correct: false }
    ],
    explanation: 'Usando la fórmula a = (v_f - v_0) / t: a = (20 - 0) / 4 = 5 m/s².'
  },
  {
    id: 2,
    question: '¿Qué ocurre con la energía cinética de un automóvil si se duplica su velocidad?',
    options: [
      { text: 'Se duplica', correct: false },
      { text: 'Se cuadruplica (aumenta 4 veces)', correct: true },
      { text: 'Permanece constante', correct: false },
      { text: 'Se reduce a la mitad', correct: false }
    ],
    explanation: 'Dado que E_k = 1/2 m v², como la velocidad v está elevada al cuadrado, (2v)² = 4v².'
  },
  {
    id: 3,
    question: '¿Cuál es el peso en la Tierra de una masa de 10 kg? (g = 9.8 m/s²)',
    options: [
      { text: '10 N', correct: false },
      { text: '98 N', correct: true },
      { text: '9.8 kg', correct: false },
      { text: '100 N', correct: false }
    ],
    explanation: 'El peso se calcula con P = m · g = 10 kg · 9.8 m/s² = 98 N.'
  },
  {
    id: 4,
    question: 'Un objeto cae libremente desde cierta altura. Ignorando el aire, su velocidad a los 3 segundos de caer es aproximadamente:',
    options: [
      { text: '29.4 m/s', correct: true },
      { text: '9.8 m/s', correct: false },
      { text: '15 m/s', correct: false },
      { text: '44.1 m/s', correct: false }
    ],
    explanation: 'En caída libre v = g · t = 9.8 m/s² · 3 s = 29.4 m/s.'
  },
  {
    id: 5,
    question: 'Según la Ley de Ohm, si duplicamos el voltaje en un circuito manteniendo la resistencia constante, ¿qué sucede con la corriente?',
    options: [
      { text: 'Se duplica', correct: true },
      { text: 'Se reduce a la mitad', correct: false },
      { text: 'Permanece igual', correct: false },
      { text: 'Se cuadruplica', correct: false }
    ],
    explanation: 'I = V / R. Al duplicar el voltaje V, la corriente I también se duplica de forma directamente proporcional.'
  }
];

export default function PracticeQuiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (index) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setShowResult(true);

    if (currentQ.options[index].correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setIsFinished(false);
  };

  return (
    <div className="glass-panel quiz-card">
      {!isFinished ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.85rem' }}>
            <span className="solution-tag">
              <Award size={14} /> Pregunta {currentIdx + 1} de {QUIZ_QUESTIONS.length}
            </span>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              Puntaje: {score} pts
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', color: '#fff', lineHeight: '1.5' }}>
            {currentQ.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentQ.options.map((opt, idx) => {
              let btnClass = 'quiz-option';
              if (selectedOption !== null) {
                if (opt.correct) btnClass += ' selected-correct';
                else if (selectedOption === idx) btnClass += ' selected-incorrect';
              }

              return (
                <button
                  key={idx}
                  className={btnClass}
                  onClick={() => handleSelectOption(idx)}
                >
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ background: currentQ.options[selectedOption].correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', padding: '1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${currentQ.options[selectedOption].correct ? '#10b981' : '#ef4444'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.35rem', color: currentQ.options[selectedOption].correct ? '#6ee7b7' : '#fca5a5' }}>
                  {currentQ.options[selectedOption].correct ? (
                    <>
                      <CheckCircle2 size={18} /> ¡Excelente trabajo! Anto 🫶 está orgullosa.
                    </>
                  ) : (
                    <>
                      <XCircle size={18} /> Casi... ¡No te preocupes, así se aprende!
                    </>
                  )}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                  <strong>Explicación de Anto:</strong> {currentQ.explanation}
                </p>
              </div>

              <button className="btn-primary" onClick={handleNext} style={{ alignSelf: 'flex-end' }}>
                Siguiente Pregunta <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        /* Pantalla de Fin de Quiz */
        <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Sparkles size={48} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.6rem' }}>¡Quiz Completado! 🏆</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
            Obtuviste <strong style={{ color: 'var(--accent-cyan)' }}>{score} de {QUIZ_QUESTIONS.length}</strong> respuestas correctas.
          </p>

          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-purple)', maxWidth: '400px' }}>
            <p style={{ fontSize: '0.92rem', color: '#f8fafc', fontStyle: 'italic' }}>
              "¡Recuerda que la física es el lenguaje con el que entendemos el universo! Sigue practicando 🫶" — Anto
            </p>
          </div>

          <button className="btn-primary" onClick={handleRestart} style={{ marginTop: '1rem' }}>
            <RotateCcw size={18} /> Volver a Intentar
          </button>
        </div>
      )}
    </div>
  );
}
