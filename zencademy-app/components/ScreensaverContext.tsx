import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ScreensaverContextType = {
  active: boolean;
  showTitle: boolean;
  gradPhase: number;
  key: number;
  /** When false, idle timer will not fire (e.g. user is not on Home). */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  setScreensaverActive: (active: boolean) => void;
  dismiss: () => void;
  resetTimer: () => void;
};

const ScreensaverContext = createContext<ScreensaverContextType | undefined>(undefined);

const IDLE_MS = 45000;

export function ScreensaverProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [key, setKey] = useState(0);
  const [gradPhase, setGradPhase] = useState(0);
  const [enabled, setEnabledState] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const enabledRef = useRef(false);
  const activeRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (!active) return;
    let t = 0;
    let dir = 1;
    const interval = setInterval(() => {
      t += 0.008 * dir;
      if (t >= 1) { t = 1; dir = -1; }
      if (t <= 0) { t = 0; dir = 1; }
      setGradPhase(t);
    }, 80);
    return () => clearInterval(interval);
  }, [active]);

  const clearIdle = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = undefined;
  };

  const scheduleIdle = useCallback(() => {
    clearIdle();
    if (!enabledRef.current) return;
    timerRef.current = setTimeout(() => {
      if (!enabledRef.current || activeRef.current) return;
      setActive(true);
      setShowTitle(true);
      setKey(Math.random());
    }, IDLE_MS);
  }, []);

  const dismiss = useCallback(() => {
    clearIdle();
    setShowTitle(false);
    setActive(false);
    setKey(Math.random());
    if (enabledRef.current) scheduleIdle();
  }, [scheduleIdle]);

  const resetTimer = useCallback(() => {
    if (activeRef.current) {
      dismiss();
      return;
    }
    scheduleIdle();
  }, [dismiss, scheduleIdle]);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    enabledRef.current = next;
    if (!next) {
      clearIdle();
      setActive(false);
      setShowTitle(false);
    } else {
      scheduleIdle();
    }
  }, [scheduleIdle]);

  const setScreensaverActive = useCallback((next: boolean) => {
    if (next) {
      if (!enabledRef.current) return;
      setActive(true);
      setShowTitle(true);
    } else {
      setActive(false);
      setShowTitle(false);
      if (enabledRef.current) scheduleIdle();
    }
  }, [scheduleIdle]);

  useEffect(() => () => clearIdle(), []);

  return (
    <ScreensaverContext.Provider
      value={{
        active,
        showTitle,
        gradPhase,
        key,
        enabled,
        setEnabled,
        setScreensaverActive,
        dismiss,
        resetTimer,
      }}
    >
      {children}
    </ScreensaverContext.Provider>
  );
}

export function useScreensaver() {
  const ctx = useContext(ScreensaverContext);
  if (!ctx) throw new Error('useScreensaver must be used within a ScreensaverProvider');
  return ctx;
}
