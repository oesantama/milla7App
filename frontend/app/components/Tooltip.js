'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Componente Tooltip reutilizable
 * Muestra información contextual al hover
 */
export default function Tooltip({ children, content, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div className={`tooltip tooltip-${position}`} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
}

/**
 * Tour guiado con Intro.js style
 * Para nuevos usuarios
 */
export function OnboardingTour({ steps, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finishTour = () => {
    setIsActive(false);
    onComplete?.();
  };

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];

  return (
    <>
      <div className="tour-overlay" onClick={finishTour} />
      <div className="tour-tooltip" style={step.position}>
        <div className="tour-header">
          <h3>{step.title}</h3>
          <button onClick={finishTour} aria-label="Cerrar tour">
            <X size={20} />
          </button>
        </div>
        <div className="tour-content">
          <p>{step.content}</p>
        </div>
        <div className="tour-footer">
          <div className="tour-progress">
            {currentStep + 1} de {steps.length}
          </div>
          <div className="tour-actions">
            {currentStep > 0 && (
              <button onClick={prevStep} className="btn-secondary btn-sm">
                Anterior
              </button>
            )}
            <button onClick={nextStep} className="btn-primary btn-sm">
              {currentStep < steps.length - 1 ? 'Siguiente' : 'Finalizar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
