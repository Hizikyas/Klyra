// components/Stepper.tsx
"use client";

import React, { useState, Children } from "react";

interface StepperProps {
  children: React.ReactNode;
  initialStep?: number;
  onFinalStepCompleted?: () => void;
  nextButtonProps?: (step: number) => any;
  backButtonProps?: any;
}

export default function Stepper({
  children,
  initialStep = 1,
  onFinalStepCompleted = () => {},
  nextButtonProps = () => ({}),
  backButtonProps = {},
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isLastStep = currentStep === totalSteps;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinalStepCompleted();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const nextButtonPropsValue = nextButtonProps(currentStep);

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/20 p-6 bg-white/10 backdrop-blur-md">
      {/* Step Indicators */}
      <div className="flex w-full items-center justify-center mb-8">
        {stepsArray.map((_, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <React.Fragment key={stepNumber}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-semibold transition-colors duration-200 ${
                  isCompleted
                    ? "bg-cyan-400"
                    : isActive
                    ? "bg-cyan-400"
                    : "bg-gray-600"
                }`}
              >
                {isCompleted ? (
                  <CheckIcon className="h-4 w-4 text-black" />
                ) : (
                  <span className="text-sm text-white">{stepNumber}</span>
                )}
              </div>
              {index < stepsArray.length - 1 && (
                <div className="mx-2 h-0.5 w-8 bg-gray-600" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Step Content */}
      <div className="min-h-[300px]">
        {stepsArray[currentStep - 1]}
      </div>

      {/* Navigation Buttons */}
      <div className={`mt-8 flex ${currentStep !== 1 ? "justify-between" : "justify-end"}`}>
        {currentStep !== 1 && (
          <button
            onClick={handleBack}
            data-step="back"
            className="bg-transparent text-white hover:text-cyan-400 transition-colors duration-200 px-4 py-2 rounded-full hover:bg-white/10"
            {...backButtonProps}
          >
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          data-step={isLastStep ? "complete" : "next"}
          disabled={nextButtonPropsValue.disabled}
          className={`font-semibold px-6 py-2 rounded-full transition-all duration-200 ${
            nextButtonPropsValue.disabled 
              ? 'bg-gray-500 cursor-not-allowed text-gray-300' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105'
          }`}
        >
          {isLastStep ? "Complete" : "Next"}
        </button>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export function Step({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}