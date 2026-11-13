import React, { useState } from 'react';
import { Droplets, Sun, Sparkles } from 'lucide-react';
import { NurtureAction } from '../types/sunflower';

interface NurtureControlsProps {
  onNurture: (action: NurtureAction) => Promise<void>;
  disabled?: boolean;
}

export const NurtureControls: React.FC<NurtureControlsProps> = ({ onNurture, disabled }) => {
  const [activeAction, setActiveAction] = useState<NurtureAction | null>(null);

  const handleClick = async (action: NurtureAction) => {
    if (disabled || activeAction) return;
    setActiveAction(action);
    try {
      await onNurture(action);
    } finally {
      setTimeout(() => setActiveAction(null), 400);
    }
  };

  return (
    <div className="glass-panel p-2.5 rounded-2xl flex items-center gap-2 max-w-md w-full justify-center">
      {/* Water Action */}
      <button
        type="button"
        disabled={disabled || !!activeAction}
        onClick={() => handleClick('water')}
        className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex flex-col items-center gap-1.5 border ${
          activeAction === 'water'
            ? 'scale-95 bg-sky-500/30 border-sky-400 text-sky-200 shadow-lg shadow-sky-500/30'
            : 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-300 hover:border-sky-400'
        } disabled:opacity-50 disabled:pointer-events-none active:scale-95`}
      >
        <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
          <Droplets className="w-5 h-5 animate-bounce" />
        </div>
        <span className="font-semibold text-white">Water</span>
        <span className="text-[10px] text-sky-300/80">+20% Hydrate</span>
      </button>

      {/* Sunlight Action */}
      <button
        type="button"
        disabled={disabled || !!activeAction}
        onClick={() => handleClick('sunlight')}
        className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex flex-col items-center gap-1.5 border ${
          activeAction === 'sunlight'
            ? 'scale-95 bg-amber-500/30 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/30'
            : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300 hover:border-amber-400'
        } disabled:opacity-50 disabled:pointer-events-none active:scale-95`}
      >
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
          <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <span className="font-semibold text-white">Sunlight</span>
        <span className="text-[10px] text-amber-300/80">+20% Light</span>
      </button>

      {/* Fertilize Action */}
      <button
        type="button"
        disabled={disabled || !!activeAction}
        onClick={() => handleClick('fertilize')}
        className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex flex-col items-center gap-1.5 border ${
          activeAction === 'fertilize'
            ? 'scale-95 bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/30'
            : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:border-emerald-400'
        } disabled:opacity-50 disabled:pointer-events-none active:scale-95`}
      >
        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <span className="font-semibold text-white">Fertilize</span>
        <span className="text-[10px] text-emerald-300/80">+15% Growth</span>
      </button>
    </div>
  );
};
