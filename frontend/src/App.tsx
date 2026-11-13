import React, { useState, useEffect, useRef } from 'react';
import { Sunflower, NurtureAction, CreateSunflowerInput } from './types/sunflower';
import { sunflowerApi } from './services/sunflowerApi';
import { SunflowerCanvas, SunflowerCanvasHandle } from './components/SunflowerCanvas';
import { TelemetryHUD } from './components/TelemetryHUD';
import { NurtureControls } from './components/NurtureControls';
import { GrowthScrubber } from './components/GrowthScrubber';
import { GardenSelector } from './components/GardenSelector';
import { PlantModal } from './components/PlantModal';

export const App: React.FC = () => {
  const [sunflowers, setSunflowers] = useState<Sunflower[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState<boolean>(false);

  // Growth Scrubber / Preview Mode
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubGrowth, setScrubGrowth] = useState<number>(50);

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<SunflowerCanvasHandle | null>(null);

  // Load flowers on mount
  useEffect(() => {
    loadSunflowers();
  }, [isLiveApi]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const loadSunflowers = async () => {
    sunflowerApi.setLiveMode(isLiveApi);
    const list = await sunflowerApi.getAll();
    setSunflowers(list);
    if (list.length > 0) {
      // Keep selected or pick first
      if (!selectedId || !list.some((s) => s.id === selectedId)) {
        setSelectedId(list[0].id);
        setScrubGrowth(list[0].growthStage);
      }
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const selected = sunflowers.find((s) => s.id === id);
    if (selected) {
      setScrubGrowth(selected.growthStage);
    }
  };

  const handleToggleLiveApi = (enabled: boolean) => {
    setIsLiveApi(enabled);
    sunflowerApi.setLiveMode(enabled);
    showToast(enabled ? '📡 Switched to Live API mode' : '🏡 Switched to Local Mock mode');
  };

  const handleNurture = async (action: NurtureAction) => {
    if (!selectedId) return;

    // Trigger canvas particle burst immediately for responsive feedback
    canvasRef.current?.triggerBurst(action);

    try {
      const result = await sunflowerApi.nurture(selectedId, action);
      // Update local state
      setSunflowers((prev) =>
        prev.map((s) => (s.id === selectedId ? result.sunflower : s))
      );
      if (!isScrubbing) {
        setScrubGrowth(result.sunflower.growthStage);
      }
      showToast(result.message);
    } catch (err: any) {
      showToast(`Error: ${err.message || 'Action failed'}`);
    }
  };

  const handlePlant = async (input: CreateSunflowerInput) => {
    try {
      const created = await sunflowerApi.create(input);
      setSunflowers((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setScrubGrowth(created.growthStage);
      showToast(`Planted "${created.name}" successfully! 🌱`);
    } catch (err: any) {
      showToast(`Error planting seed: ${err.message || 'Failed'}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await sunflowerApi.delete(id);
      const remaining = sunflowers.filter((s) => s.id !== id);
      setSunflowers(remaining);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
        setScrubGrowth(remaining[0].growthStage);
      }
      showToast('Sunflower removed from garden.');
    } catch (err: any) {
      showToast(`Error deleting sunflower: ${err.message}`);
    }
  };

  const selectedFlower = sunflowers.find((s) => s.id === selectedId);

  // Effective values passed to canvas (allows scrub mode override)
  const effectiveGrowth = isScrubbing ? scrubGrowth : (selectedFlower?.growthStage ?? 0);
  const effectiveHeight = isScrubbing
    ? Math.max(5, 5 + (scrubGrowth / 100) * 195)
    : (selectedFlower?.height ?? 5.0);

  return (
    <div className="relative w-screen h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Navigation & Garden Selector */}
      <GardenSelector
        sunflowers={sunflowers}
        selectedId={selectedId}
        onSelect={handleSelect}
        onOpenPlantModal={() => setIsPlantModalOpen(true)}
        onDeleteSunflower={handleDelete}
        isLiveApi={isLiveApi}
        onToggleLiveApi={handleToggleLiveApi}
      />

      {/* Main Procedural Canvas Viewport */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {selectedFlower ? (
          <SunflowerCanvas
            ref={canvasRef}
            growthStage={effectiveGrowth}
            height={effectiveHeight}
            waterLevel={selectedFlower.waterLevel}
            sunlightExposure={selectedFlower.sunlightExposure}
            petalColor={selectedFlower.petalColor}
            flowerName={selectedFlower.name}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <span className="text-4xl">🌱</span>
            <p className="text-sm">No sunflowers planted yet.</p>
            <button
              type="button"
              onClick={() => setIsPlantModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all"
            >
              Plant a Seed
            </button>
          </div>
        )}

        {/* Floating Telemetry HUD (Left) */}
        {selectedFlower && (
          <div className="absolute top-4 left-4 z-10 hidden md:block">
            <TelemetryHUD
              sunflower={{
                ...selectedFlower,
                growthStage: effectiveGrowth,
                height: effectiveHeight,
              }}
            />
          </div>
        )}

        {/* Floating Controls & Scrubber (Bottom Center) */}
        {selectedFlower && (
          <div className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-3 px-4 pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-center gap-3 w-full max-w-xl">
              <NurtureControls onNurture={handleNurture} />
              <GrowthScrubber
                isScrubbing={isScrubbing}
                onToggleScrubbing={setIsScrubbing}
                growthValue={scrubGrowth}
                onGrowthChange={setScrubGrowth}
                onResetGrowth={() => {
                  setScrubGrowth(selectedFlower.growthStage);
                  setIsScrubbing(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Toast Feedback Notification */}
        {toastMessage && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-float">
            <div className="glass-panel px-4 py-2 rounded-full text-xs font-semibold text-amber-200 border border-amber-400/40 shadow-xl shadow-amber-500/10 flex items-center gap-2">
              <span>🌻</span>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </main>

      {/* Plant Modal (Native HTML <dialog> compliant) */}
      <PlantModal
        isOpen={isPlantModalOpen}
        onClose={() => setIsPlantModalOpen(false)}
        onPlant={handlePlant}
      />
    </div>
  );
};

export default App;
