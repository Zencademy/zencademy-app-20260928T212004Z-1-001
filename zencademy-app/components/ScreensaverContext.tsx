import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type ScreensaverContextType = {
  active: boolean;
  showTitle: boolean;
  gradPhase: number;
  key: number;
  setScreensaverActive: (active: boolean) => void;
  resetTimer: () => void;
};
const ScreensaverContext = createContext<ScreensaverContextType | undefined>(undefined);

export function ScreensaverProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [key, setKey] = useState(0);
  const [gradPhase, setGradPhase] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);
  const isAnyScreenActive = useRef<boolean>(true);

  // Gradient pulse - throttled interval for lower CPU usage on low-end devices
  useEffect(() => {
    if (!active) return;
    let t = 0, dir = 1, interval;
    // Keep roughly the same perceived speed but with fewer updates
    const step = 0.005; // was 0.013 at 25ms; now ~60ms
    interval = setInterval(() => {
      t += step * dir;
      if (t >= 1) { t = 1; dir = -1; }
      if (t <= 0) { t = 0; dir = 1; }
      setGradPhase(t);
    }, 60); // reduced update rate to cut CPU wakeups
    return () => clearInterval(interval);
  }, [active]);

  // Timer global
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (active) {
      setShowTitle(false);
      setActive(false);
      // Force a small delay to ensure state updates properly
      setTimeout(() => {
        setKey(Math.random());
      }, 100);
    }
    timerRef.current = setTimeout(() => {
      if (isAnyScreenActive.current) {
        setActive(true);
        setKey(Math.random());
        setShowTitle(true);
      }
    }, 20000); // 20 secunde de inactivitate
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const setScreensaverActive = (active: boolean) => {
    setActive(active);
    setShowTitle(active);
  };

  return (
    <ScreensaverContext.Provider value={{
      active,
      showTitle,
      gradPhase,
      key,
      setScreensaverActive,
      resetTimer,
    }}>
      {children}
    </ScreensaverContext.Provider>
  );
}

export function useScreensaver() {
  const ctx = useContext(ScreensaverContext);
  if (!ctx) throw new Error('useScreensaver must be used within a ScreensaverProvider');
  return ctx;
}
