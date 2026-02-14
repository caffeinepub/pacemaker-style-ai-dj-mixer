import { useState, useEffect } from 'react';
import type { TrackMetadata } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';
import { useGetAllTracks } from './useQueries';

export interface LocalTrack extends TrackMetadata {
  audioBuffer?: AudioBuffer;
  file?: File;
}

export function useTrackLibrary() {
  const { identity } = useInternetIdentity();
  const { data: backendTracks = [] } = useGetAllTracks();
  const [localTracks, setLocalTracks] = useState<LocalTrack[]>([]);

  const isAuthenticated = !!identity;

  // Merge backend and local tracks
  const allTracks = isAuthenticated ? backendTracks : localTracks;

  const addLocalTrack = (track: LocalTrack) => {
    setLocalTracks(prev => [...prev, track]);
  };

  const removeLocalTrack = (id: bigint) => {
    setLocalTracks(prev => prev.filter(t => t.id !== id));
  };

  const clearLocalTracks = () => {
    setLocalTracks([]);
  };

  return {
    tracks: allTracks,
    localTracks,
    addLocalTrack,
    removeLocalTrack,
    clearLocalTracks,
    isAuthenticated,
  };
}
