import React, { useState, useEffect } from 'react';

interface OnboardingProps {
  onDismiss: () => void;
  isFirstTime?: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ onDismiss, isFirstTime = true }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, [currentStep]);

  const steps = [
    {
      icon: '⏱️',
      title: 'Welcome to Git Wayback Machine',
      description: 'Travel through your git history like a time machine. Watch your code evolve, commit by commit.',
      highlight: 'Select a file in your project to get started',
    },
    {
      icon: '🎬',
      title: 'Play & Replay',
      description: 'Use the playback controls to step through commits or auto-play the history. Control the speed to see changes unfold at your pace.',
      highlight: 'Press play to watch commits happen in real-time',
    },
    {
      icon: '👥',
      title: 'Explore Contributors',
      description: 'See who changed what and when. Visualize contributions over time with beautiful contributor graphs.',
      highlight: 'Filter by author to focus on specific contributors',
    },
    {
      icon: '🔍',
      title: 'Search & Analyze',
      description: 'Find commits by message, hash, author, or date range. Deep insights help you understand your codebase evolution.',
      highlight: 'Use advanced search to find that one crucial commit',
    },
    {
      icon: '🎨',
      title: 'Customize Your View',
      description: 'Adjust settings to match your workflow. Change themes, speed, and display options to your liking.',
      highlight: 'Visit Settings for full customization',
    },
  ];

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Animated background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        {/* Content */}
        <div className="relative p-8 space-y-6">
          {/* Progress indicator */}
          <div className="flex gap-1 justify-center">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 w-8'
                    : idx < currentStep
                    ? 'bg-blue-400 w-2'
                    : 'bg-white/20 w-2'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className={`space-y-4 transition-all ${animated ? 'opacity-100' : 'opacity-0'}`}>
            {/* Icon */}
            <div className="text-6xl text-center animate-bounce">{step.icon}</div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-white font-display">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-center text-gray-300 leading-relaxed">{step.description}</p>

            {/* Highlight box */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-200 font-semibold">{step.highlight}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors border border-white/20"
              >
                Previous
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => {
                  setAnimated(false);
                  setTimeout(() => setCurrentStep(currentStep + 1), 100);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all shadow-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onDismiss}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold transition-all shadow-lg"
              >
                Get Started
              </button>
            )}
          </div>

          {/* Skip button */}
          <button
            onClick={onDismiss}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Done' : 'Skip tutorial'}
          </button>
        </div>

        {/* Decorative corners */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-blue-400/40" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-purple-400/40" />
      </div>
    </div>
  );
};

export default Onboarding;
