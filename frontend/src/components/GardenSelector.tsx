import React from 'react';
import { Plus, Trash2, Sprout, Wifi, WifiOff } from 'lucide-react';
import { Sunflower } from '../types/sunflower';

interface GardenSelectorProps {
  sunflowers: Sunflower[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenPlantModal: () => void;
  onDeleteSunflower: (id: string) => void;
  isLiveApi: boolean;
  onToggleLiveApi: (enabled: boolean) => void;
}

export const GardenSelector: React.FC<GardenSelectorProps> = ({
  sunflowers,
  selectedId,
  onSelect,
  onOpenPlantModal,
  onDeleteSunflower,
  isLiveApi,
  onToggleLiveApi,
}) => {
  const selectedFlower = sunflowers.find((s) => s.id === selectedId);

  return (
    <header className="w-full glass-panel-subtle px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 z-20">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-lg">
          🌻
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Sunflower Botanical Garden</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Phase 2 Engine
            </span>
          </h1>
          <p className="text-[11px] text-slate-400">
            60FPS Procedural Canvas & Fibonacci Phyllotaxis Simulation
          </p>
        </div>
      </div>

      {/* Garden Sunflower Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
        {sunflowers.map((flower) => {
          const isSelected = flower.id === selectedId;
          return (
            <button
              key={flower.id}
              type="button"
              onClick={() => onSelect(flower.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
                isSelected
                  ? 'bg-amber-500/20 text-white border-amber-400/80 shadow-md shadow-amber-500/10'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/30"
                style={{ backgroundColor: flower.petalColor }}
              />
              <span className="truncate max-w-[120px]">{flower.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {Math.round(flower.growthStage)}%
              </span>
            </button>
          );
        })}

        {/* Plant New Seed Button */}
        <button
          type="button"
          onClick={onOpenPlantModal}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Plant Seed</span>
        </button>

        {/* Delete Sunflower Button */}
        {selectedFlower && sunflowers.length > 1 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to remove "${selectedFlower.name}" from the garden?`)) {
                onDeleteSunflower(selectedFlower.id);
              }
            }}
            title="Remove sunflower"
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Mode / API Indicator Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onToggleLiveApi(!isLiveApi)}
          title={isLiveApi ? 'Connected to Backend /api/sunflowers' : 'Running in Local Mock Mode (Phase 2 default)'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
            isLiveApi
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800/80 text-slate-400 border-white/10 hover:text-white'
          }`}
        >
          {isLiveApi ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live API</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Local Mock</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
