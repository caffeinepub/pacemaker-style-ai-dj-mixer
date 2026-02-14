import { useState, useEffect } from 'react';
import { useInternetIdentity } from './useInternetIdentity';
import { useGetAllMixes, useSaveMix } from './useQueries';
import type { MixMetadata } from '../backend';

export interface LocalMixSession {
  id: string;
  title: string;
  tracks: bigint[];
  duration: number;
  createdAt: number;
  audioBlob?: Blob;
}

const STORAGE_KEY = 'local-mix-history';

export function useMixHistory() {
  const { identity } = useInternetIdentity();
  const { data: backendMixes = [] } = useGetAllMixes();
  const saveMixMutation = useSaveMix();
  const [localMixes, setLocalMixes] = useState<LocalMixSession[]>([]);

  const isAuthenticated = !!identity;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLocalMixes(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load local mix history:', e);
    }
  }, []);

  const saveLocalMix = (mix: LocalMixSession) => {
    const updated = [...localMixes, mix];
    setLocalMixes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.map(m => ({
        ...m,
        audioBlob: undefined, // Don't store blobs in localStorage
      }))));
    } catch (e) {
      console.warn('Failed to save local mix:', e);
    }
  };

  const saveMixToBackend = async (mix: Omit<MixMetadata, 'id' | 'creator' | 'createdAt'>) => {
    if (!isAuthenticated) return;
    
    const mixMetadata: MixMetadata = {
      id: BigInt(0),
      creator: identity!.getPrincipal(),
      createdAt: BigInt(Date.now() * 1000000),
      ...mix,
      duration: BigInt(mix.duration),
    };

    await saveMixMutation.mutateAsync(mixMetadata);
  };

  return {
    localMixes,
    backendMixes,
    saveLocalMix,
    saveMixToBackend,
    isAuthenticated,
  };
}
