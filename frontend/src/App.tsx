import React, { useState, useEffect, useRef } from 'react';
import { Sunflower, NurtureAction, CreateSunflowerInput } from './types/sunflower';
import { sunflowerApi } from './services/sunflowerApi';
import { SunflowerCanvas, SunflowerCanvasHandle } from './components/SunflowerCanvas';
import { TelemetryHUD } from './components/TelemetryHUD';
import { NurtureControls } from './components/NurtureControls';
import { GrowthScrubber } from './components/GrowthScrubber';
import { GardenSelector } from './components/GardenSelector';
import { PlantModal } from './components/PlantModal';
import { soundEffects } from './utils/soundEffects';

export const App: React.FC = () => {
  const [sunflowers, setSunflowers] = useState<Sunflower[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isLiveApi, setIsLiveApi] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState<boolean>(false);

  // Sound Engine Mute State (muted by default)
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.isMuted());

  // Growth Scrubber / Preview Mode
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubGrowth, setScrubGrowth] = useState<number>(50);

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<SunflowerCanvasHandle | null>(null);

  // Load flowers on initial mount
  useEffect(() => {
    loadSunflowers(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const loadSunflowers = async (isInitial = false) => {
    setIsLoading(true);
    try {
      const isOnline = await sunflowerApi.checkHealth();
      setIsLiveApi(isOnline);

      const result = await sunflowerApi.getAll();
      setSunflowers(result.data);

      if (result.data.length > 0) {
        setSelectedId((current) => {
          if (!current || !result.data.some((s) => s.id === current)) {
            const first = result.data[0];
            setScrubGrowth(first.growthStage);
            return first.id;
          }
          const existing = result.data.find((s) => s.id === current);
          if (existing && !isScrubbing) {
            setScrubGrowth(existing.growthStage);
          }
          return current;
        });
      }

      if (isInitial) {
        if (result.source === 'live') {
          showToast('🟢 Connected to Express backend (:5000) & SQLite DB');
        } else {
          showToast('⚠️ Express backend offline: Running in Local Garden Mode');
        }
      } else {
        showToast(result.source === 'live' ? '🔄 Synced with live database' : '🔄 Synced with local garden');
      }
    } catch (err: any) {
      showToast(`Sync error: ${err.message || 'Could not fetch garden'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const selected = sunflowers.find((s) => s.id === id);
    if (selected) {
      setScrubGrowth(selected.growthStage);
    }
  };

  const handleToggleSound = () => {
    const newMuted = soundEffects.toggleMute();
    setIsMuted(newMuted);
    showToast(newMuted ? '🔇 Ambient Sound Effects Muted' : '🔊 Ambient Botanical Sounds Enabled');
  };

  const handleNurture = async (action: NurtureAction) => {
    if (!selectedId) return;
    const currentFlower = sunflowers.find((s) => s.id === selectedId);
    if (!currentFlower) return;

    const prevGrowth = currentFlower.growthStage;

    // 1. Trigger Canvas Particle System immediately
    canvasRef.current?.triggerBurst(action);

    // 2. Play Synthesized Web Audio Effect
    if (action === 'water') {
      soundEffects.playWaterSplash();
    } else if (action === 'sunlight') {
      soundEffects.playSunShimmer();
    } else if (action === 'fertilize') {
      soundEffects.playFertilizeChime();
    }

    // 3. Optimistic UI update for instantaneous responsiveness
    const optimisticDelta = action === 'fertilize' ? 15 : 8;
    const optimisticGrowth = Math.min(100, currentFlower.growthStage + optimisticDelta);
    const optimisticHeight = Math.min(220, Math.round((currentFlower.height + (action === 'fertilize' ? 6.5 : 3.8)) * 10) / 10);
    const optimisticWater = action === 'water'
      ? Math.min(100, currentFlower.waterLevel + 20)
      : Math.max(0, currentFlower.waterLevel - (action === 'fertilize' ? 10 : 8));
    const optimisticSun = action === 'sunlight'
      ? Math.min(100, currentFlower.sunlightExposure + 20)
      : Math.max(0, currentFlower.sunlightExposure - (action === 'fertilize' ? 6 : 4));

    setSunflowers((prev) =>
      prev.map((s) =>
        s.id === selectedId
          ? {
              ...s,
              growthStage: optimisticGrowth,
              height: optimisticHeight,
              waterLevel: optimisticWater,
              sunlightExposure: optimisticSun,
              lastWateredAt: action === 'water' ? new Date().toISOString() : s.lastWateredAt,
            }
          : s
      )
    );

    if (!isScrubbing) {
      setScrubGrowth(optimisticGrowth);
    }

    try {
      // 4. Send Live REST Request to Backend (PATCH /api/sunflowers/:id/nurture)
      const result = await sunflowerApi.nurture(selectedId, action);
      setIsLiveApi(result.source === 'live');

      // Update state with confirmed database record
      setSunflowers((prev) =>
        prev.map((s) => (s.id === selectedId ? result.sunflower : s))
      );
      if (!isScrubbing) {
        setScrubGrowth(result.sunflower.growthStage);
      }

      // Check Milestone Chimes
      if (prevGrowth < 50 && result.sunflower.growthStage >= 50) {
        soundEffects.playBloomChime(50);
        showToast('🌾 Milestone Reached: Swelling Flower Bud!');
      } else if (prevGrowth < 100 && result.sunflower.growthStage >= 100) {
        soundEffects.playBloomChime(100);
        canvasRef.current?.triggerBurst('celebrate');
        showToast('🌻 Celebration: Radiant 100% Full Bloom!');
      } else {
        showToast(result.message);
      }
    } catch (err: any) {
      showToast(`Error nurturing sunflower: ${err.message || 'Server error'}`);
    }
  };

  const handlePlant = async (input: CreateSunflowerInput) => {
    try {
      const result = await sunflowerApi.create(input);
      setIsLiveApi(result.source === 'live');
      const created = result.data;

      setSunflowers((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setScrubGrowth(created.growthStage);

      showToast(
        result.source === 'live'
          ? `Planted "${created.name}" in SQLite database! 🌱`
          : `Planted "${created.name}" locally! 🌱`
      );
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
      showToast('Sunflower removed.');
    } catch (err: any) {
      showToast(`Error deleting sunflower: ${err.message}`);
    }
  };

  const selectedFlower = sunflowers.find((s) => s.id === selectedId);

  // Effective values passed to canvas:
  // If growth scrubber is enabled, it temporarily previews canvas growth without mutating the DB
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
        onRefresh={() => loadSunflowers(false)}
        isLoading={isLoading}
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
              isMuted={isMuted}
              onToggleSound={handleToggleSound}
            />
          </div>
        )}

        {/* Floating Controls & Scrubber (Bottom Center) */}
        {selectedFlower && (
          <div className="absolute bottom-6 left-0 right-0 z-10 flex flex-col items-center gap-3 px-4 pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-center gap-3 w-full max-w-xl">
              <NurtureControls onNurture={handleNurture} disabled={isLoading} />
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
