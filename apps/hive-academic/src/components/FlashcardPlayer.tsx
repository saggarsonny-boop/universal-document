"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Lock, RefreshCw, Zap } from "lucide-react";

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  explanation: string;
};

interface FlashcardPlayerProps {
  cards: Flashcard[];
  onReset: () => void;
}

const FREE_LIMIT = 15; // Viral paywall limit

export default function FlashcardPlayer({ cards, onReset }: FlashcardPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];
  const isPaywalled = currentIndex >= FREE_LIMIT;

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <button 
          onClick={onReset}
          className="text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-white flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={14} /> Generate New
        </button>
        <div className="text-xs font-mono tracking-widest text-[#D4AF37]">
          {currentIndex + 1} / {cards.length}
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Study Deck Link copied! Share it with your classmates.");
          }}
          className="text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-[#D4AF37] flex items-center gap-2 transition-colors"
        >
          Share Deck
        </button>
      </div>

      {/* The Flashcard */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/9] perspective-1000">
        
        {isPaywalled ? (
          // Viral Paywall UI
          <div className="absolute inset-0 bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6">
              <Lock className="w-12 h-12 text-[#D4AF37] mb-4" />
              <h2 className="text-2xl font-bold tracking-widest uppercase mb-4">Academic Pro Required</h2>
              <p className="text-neutral-400 font-mono text-xs md:text-sm max-w-md mb-8 leading-relaxed">
                You've reached the free preview limit for this study set. To view the remaining {cards.length - FREE_LIMIT} cards and generate unlimited decks from your own lectures, upgrade to Pro.
              </p>
              <a 
                href="https://buy.stripe.com/7sYcN79YHe7v53AcHD0RG01" 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#D4AF37] text-black px-8 py-4 rounded font-bold tracking-[0.2em] uppercase hover:bg-[#b0902c] transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Unlock Deck <Zap size={18} />
              </a>
            </div>
            {/* Blurred Mock Content behind paywall */}
            <div className="opacity-20 blur-sm pointer-events-none">
              <h3 className="text-xl font-bold mb-4">What is the central dogma of molecular biology?</h3>
            </div>
          </div>
        ) : (
          // Flippable Card UI
          <div 
            className={`w-full h-full relative preserve-3d transition-transform duration-500 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front of card */}
            <div className="absolute inset-0 backface-hidden bg-neutral-950 border border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl hover:border-neutral-700 transition-colors">
              <span className="absolute top-6 left-6 text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">Question</span>
              <h2 className="text-2xl md:text-3xl font-bold text-center leading-tight">
                {currentCard.question}
              </h2>
              <p className="absolute bottom-6 text-neutral-600 font-mono text-xs tracking-widest uppercase animate-pulse">Click to Reveal</p>
            </div>

            {/* Back of card */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-neutral-900 border border-[#D4AF37]/50 rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl">
              <span className="absolute top-6 left-6 text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">Answer</span>
              <h2 className="text-xl md:text-2xl font-bold text-center text-[#D4AF37] mb-6 leading-tight">
                {currentCard.answer}
              </h2>
              <div className="w-full border-t border-neutral-800 pt-4 mt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-2">Explanation</span>
                <p className="text-sm text-neutral-300 leading-relaxed font-mono">
                  {currentCard.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-6 mt-8">
        <button 
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="p-4 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-neutral-800"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          onClick={nextCard}
          disabled={currentIndex === cards.length - 1 || isPaywalled}
          className={`p-4 rounded-full bg-neutral-900 transition-colors border border-neutral-800 ${isPaywalled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37]'}`}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
