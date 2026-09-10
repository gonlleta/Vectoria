import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, Sparkles, ArrowRight } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Si un vehículo parte del reposo en MRUV y alcanza 20 m/s en 4 segundos, ¿cuál es su aceleración?',
    options: [
      { text: '5 m/s²', correct: true },
      { text: '80 m/s²', correct: false },
      { text: '4 m/s²', correct: false },
      { text: '10 m/s²', correct: false }
    ],
    explanation: 'Usamos la fórmula a = (v_f - v_0) / t. Como parte del reposo v_0 = 0: a = (20 - 0) / 4 = 5 m/s².'
  },
  {
    id: 2,
    question: 'En un Movimiento Rectilíneo Uniforme (MRU), ¿cuánto vale la aceleración del móvil?',
    options: [
      { text: 'Es mayor a cero (a > 0)', correct: false },
      { text: 'Es exactamente cero (a = 0)', correct: true },
      { text: 'Es negativa (a < 0)', correct: false },
      { text: 'Depende del tiempo', correct: false }
    ],
    explanation: 'En el MRU la velocidad no cambia en ningún momento, por lo que la aceleración es 0 m/s².'
  },
  {
    id: 3,
    question: '¿A cuántos m/s equivale una velocidad constante de 90 km/h?',
    options: [
      { text: '90 m/s', correct: false },
      { text: '25 m/s', correct: true },
      { text: '324 m/s', correct: false },
      { text: '15 m/s', correct: false }
    ],
    explanation: 'Para pasar de km/h a m/s dividimos por 3.6: 90 / 3.6 = 25 m/s.'
  },
  {
    id: 4,
    question: 'Si un vehículo viaja a 30 m/s y aplica los frenos desacelerando a -6 m/s², ¿cuántos segundos tarda en detenerse por completo?',
    options: [
      { text: '5 segundos', correct: true },
      { text: '180 segundos', correct: false },
      { text: '6 segundos', correct: false },
      { text: '10 segundos', correct: false }
    ],
    explanation: 'Como se detiene v_f = 0. t = (v_f - v_0) / a = (0 - 30) / (-6) = 5 segundos.'
  },
  {
    id: 5,
    question: 'Dos automóviles separados por 500 metros viajan uno hacia el otro en MRU a 20 m/s y 30 m/s. ¿En cuántos segundos se cruzan?',
    options: [
      { text: '10 segundos', correct: true },
      { text: '25 segundos', correct: false },
      { text: '50 segundos', correct: false },
      { text: '5 segundos', correct: false }
    ],
    explanation: 'Tiempo de encuentro: t_e = D / (v1 + v2) = 500 / (20 + 30) = 500 / 50 = 10 segundos.'
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
              <Award size={14} /> Quiz MRU & MRUV — Pregunta {currentIdx + 1} de {QUIZ_QUESTIONS.length}
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
        <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Sparkles size={48} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1.6rem' }}>¡Desafío MRU/MRUV Completado! 🏆</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
            Obtuviste <strong style={{ color: 'var(--accent-cyan)' }}>{score} de {QUIZ_QUESTIONS.length}</strong> respuestas correctas.
          </p>

          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-purple)', maxWidth: '400px' }}>
            <p style={{ fontSize: '0.92rem', color: '#f8fafc', fontStyle: 'italic' }}>
              "¡Dominas los conceptos de movimiento y aceleración como todo un experto! Sigue practicando 🫶" — Anto
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
