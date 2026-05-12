'use client';
import { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';

export default function TooltipTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run the tour once per user by checking localStorage
    if (!localStorage.getItem('ud-converter-tour-seen')) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      localStorage.setItem('ud-converter-tour-seen', 'true');
      setRun(false);
    }
  };

  const steps = [
    {
      target: '#tour-file-dropzone',
      content: '1. Start here. Drag and drop any legacy PDF, DOCX, or text file into this box.',
      disableBeacon: true,
      placement: 'bottom',
    },
    {
      target: '#tour-convert-button',
      content: '2. Click Convert. Our AI engine will strip away all the visual garbage and extract the pure semantic meaning of your document.',
      placement: 'top',
    },
    {
      target: '#tour-output-format',
      content: '3. By default, it converts to UDS (Universal Document Sealed), an AI-native format guaranteed to have zero hallucinations when read by an LLM.',
      placement: 'left',
    }
  ];

  if (!run) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#D4AF37',
          backgroundColor: '#0a0a0a',
          textColor: '#f8fafc',
          arrowColor: '#0a0a0a',
        },
        buttonClose: {
          display: 'none',
        },
        buttonNext: {
          backgroundColor: '#D4AF37',
          color: '#000',
          fontWeight: 'bold',
          borderRadius: '4px',
        },
        buttonBack: {
          color: '#D4AF37',
        },
        buttonSkip: {
          color: '#94a3b8',
        }
      }}
    />
  );
}
