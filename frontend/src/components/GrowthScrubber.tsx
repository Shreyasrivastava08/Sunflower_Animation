import React from 'react';
import { Sliders, Sparkles, RotateCcw } from 'lucide-react';

interface GrowthScrubberProps {
  isScrubbing: boolean;
  onToggleScrubbing: (enabled: boolean) => void;
  growthValue: number;
  onGrowthChange: (val: number) => void;
  onResetGrowth: () => void;
}

export const GrowthScrubber: React.FC<GrowthScrubberProps> = ({
  isScrubbing,
  onToggleScrubbing,
  growthValue,
  onGrowthChange,
  onResetGrowth,
}) => {
  const getStageName = (val: number) => {
    if (val <= 15) return '🌱 Sprout Phase (0–15%)';
    if (val <= 45) return '🌿 Stalk & Leaves Phase (16–45%)';
    if (val <= 75) return '🌾 Swelling Bud Phase (46–75%)';
    return '🌻 Fibonacci Radiant Bloom (76–100%)';
  };

  return (
    <div className="glass-panel px-4 py-3 rounded-2xl flex flex-col gap-2.5 max-w-xl w-full">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleScrubbing(!isScrubbing)}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            isScrubbing
              ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isScrubbing ? 'Preview Scrubber ON' : 'Enable Preview Growth Slider'}</span>
        </button>

        {isScrubbing && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-400 font-medium">
              {getStageName(growthValue)}
            </span>
            <span className="text-[10px] text-amber-300/70 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Visual Preview Only
            </span>
            <button
              type="button"
              onClick={onResetGrowth}
              title="Reset to natural sunflower growth"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {isScrubbing && (
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
            <span>0% (Seed)</span>
            <span>25% (Leaves)</span>
            <span>50% (Bud)</span>
            <span>75% (Opening)</span>
            <span>100% (Full Bloom)</span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={growthValue}
              onChange={(e) => onGrowthChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300 transition-all border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
};
