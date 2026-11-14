import React from 'react';
import { Droplets, Sun, Sparkles, Ruler, Flower2, Clock, Volume2, VolumeX } from 'lucide-react';
import { Sunflower } from '../types/sunflower';

interface TelemetryHUDProps {
  sunflower: Sunflower;
  isMuted?: boolean;
  onToggleSound?: () => void;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  sunflower,
  isMuted = true,
  onToggleSound,
}) => {
  const getStageBadge = (stage: number) => {
    if (stage <= 15) {
      return { label: 'Seedling Sprout', emoji: '🌱', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    if (stage <= 45) {
      return { label: 'Vegetative Stalk', emoji: '🌿', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
    }
    if (stage <= 75) {
      return { label: 'Swelling Bud', emoji: '🌾', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    return { label: 'Radiant Bloom', emoji: '🌻', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
  };

  const badge = getStageBadge(sunflower.growthStage);
  const isThirsty = sunflower.waterLevel < 25;

  return (
    <div className="glass-panel p-5 rounded-2xl w-full max-w-sm flex flex-col gap-4 text-slate-100">
      {/* Title & Stage Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{sunflower.name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: sunflower.petalColor }}
            />
            <span>Petal: {sunflower.petalColor.toUpperCase()}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              title={isMuted ? 'Unmute Ambient Sound Effects' : 'Mute Ambient Sound Effects'}
              className={`p-1.5 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${badge.color}`}>
            <span>{badge.emoji}</span>
            <span>{badge.label}</span>
          </span>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* Primary Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Height */}
        <div className="glass-panel-subtle p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Stalk Height</div>
            <div className="text-lg font-bold text-white">{sunflower.height.toFixed(1)} <span className="text-xs font-normal text-slate-400">cm</span></div>
          </div>
        </div>

        {/* Growth Progress */}
        <div className="glass-panel-subtle p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Growth Stage</div>
            <div className="text-lg font-bold text-white">{Math.round(sunflower.growthStage)} <span className="text-xs font-normal text-slate-400">%</span></div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="flex flex-col gap-3">
        {/* Growth Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Flower2 className="w-3.5 h-3.5 text-yellow-400" /> Lifecycle Progress
            </span>
            <span className="text-yellow-400 font-semibold">{Math.round(sunflower.growthStage)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900/60 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-400 shadow-lg shadow-yellow-500/30"
              style={{ width: `${Math.min(100, Math.max(0, sunflower.growthStage))}%` }}
            />
          </div>
        </div>

        {/* Water Level Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" /> Hydration
              {isThirsty && (
                <span className="text-[10px] text-red-400 font-semibold px-1.5 py-0.2 rounded bg-red-500/20 animate-pulse">
                  Thirsty!
                </span>
              )}
            </span>
            <span className={`font-semibold ${isThirsty ? 'text-red-400' : 'text-sky-400'}`}>
              {sunflower.waterLevel}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900/60 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isThirsty ? 'bg-red-500' : 'bg-gradient-to-r from-sky-500 to-blue-400'
              }`}
              style={{ width: `${sunflower.waterLevel}%` }}
            />
          </div>
        </div>

        {/* Sunlight Exposure Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Sunlight Exposure
            </span>
            <span className="text-amber-400 font-semibold">{sunflower.sunlightExposure}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900/60 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 to-yellow-300"
              style={{ width: `${sunflower.sunlightExposure}%` }}
            />
          </div>
        </div>
      </div>

      {/* Last Watered Footer */}
      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-white/5">
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        <span>Last watered: {new Date(sunflower.lastWateredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>
    </div>
  );
};
