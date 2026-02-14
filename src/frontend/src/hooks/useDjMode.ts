import { useState, useEffect } from 'react';

export type DjMode = 'beginner' | 'pro';

interface DjModeState {
  mode: DjMode;
  isFirstLaunch: boolean;
}

const STORAGE_KEY = 'dj-mode-state';

function loadState(): DjModeState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load DJ mode state:', e);
  }
  return { mode: 'beginner', isFirstLaunch: true };
}

function saveState(state: DjModeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save DJ mode state:', e);
  }
}

export function useDjMode() {
  const [state, setState] = useState<DjModeState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setMode = (mode: DjMode) => {
    setState(prev => ({ ...prev, mode }));
  };

  const completeOnboarding = () => {
    setState(prev => ({ ...prev, isFirstLaunch: false }));
  };

  return {
    mode: state.mode,
    isFirstLaunch: state.isFirstLaunch,
    setMode,
    completeOnboarding,
    isBeginner: state.mode === 'beginner',
    isPro: state.mode === 'pro',
  };
}
