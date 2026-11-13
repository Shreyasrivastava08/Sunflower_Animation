import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { CreateSunflowerInput } from '../types/sunflower';

interface PlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlant: (data: CreateSunflowerInput) => Promise<void>;
}

const PRESET_COLORS = [
  { name: 'Classic Gold', hex: '#FFD700', description: 'Sun-drenched golden yellow' },
  { name: 'Sunset Orange', hex: '#FF7F50', description: 'Vibrant dusk coral and bronze' },
  { name: 'Crimson Velvet', hex: '#DC143C', description: 'Deep red autumn monarch' },
  { name: 'Pale Lemon', hex: '#FFF44F', description: 'Delicate pastel citrus bloom' },
];

export const PlantModal: React.FC<PlantModalProps> = ({ isOpen, onClose, onPlant }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [name, setName] = useState('');
  const [petalColor, setPetalColor] = useState('#FFD700');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onPlant({
        name: name.trim() || 'Sunny Sprout',
        petalColor,
        growthStage: 0,
        waterLevel: 60,
        sunlightExposure: 50,
        height: 5.0,
      });
      setName('');
      setPetalColor('#FFD700');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="plant-modal-title"
      className="m-auto rounded-3xl overflow-hidden shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-md outline-none"
    >
      <div className="glass-panel p-6 max-w-md w-[92vw] sm:w-[440px] flex flex-col gap-5 text-slate-100 rounded-3xl border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="plant-modal-title" className="text-lg font-bold text-white tracking-tight">
                Plant a New Seed
              </h2>
              <p className="text-xs text-slate-400">
                Choose a name and petal variety for your sunflower
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Sunflower Name Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sunflower-name" className="text-xs font-semibold text-slate-300">
              Sunflower Name
            </label>
            <input
              id="sunflower-name"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Golden Majesty, Summer Joy"
              maxLength={40}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
          </div>

          {/* Color Preset Palette */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300">
              Petal Variety & Color
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setPetalColor(preset.hex)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    petalColor.toLowerCase() === preset.hex.toLowerCase()
                      ? 'border-amber-400 bg-amber-400/10 shadow-md shadow-amber-500/10'
                      : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/70 hover:border-white/20'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 border border-white/30 shadow-sm flex items-center justify-center"
                    style={{ backgroundColor: preset.hex }}
                  >
                    {petalColor.toLowerCase() === preset.hex.toLowerCase() && (
                      <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                    )}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-medium text-white truncate">{preset.name}</div>
                    <div className="text-[10px] text-slate-400">{preset.hex}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Hex Picker Input */}
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={petalColor}
                onChange={(e) => setPetalColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
              />
              <input
                type="text"
                value={petalColor}
                onChange={(e) => setPetalColor(e.target.value)}
                placeholder="#FFD700"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-slate-400">Custom Hex</span>
            </div>
          </div>

          {/* Initial Seed Stats Preview */}
          <div className="glass-panel-subtle p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <span>Initial Stage: Seed (0%)</span>
            <span>Height: 5.0 cm</span>
            <span>Hydration: 60%</span>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-400/25 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Planting Seed...' : '🌱 Plant Seed'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
