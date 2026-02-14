import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TrackMetadata, MixMetadata, UserProfile, StreamingLibrary } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllTracks() {
  const { actor, isFetching } = useActor();

  return useQuery<TrackMetadata[]>({
    queryKey: ['tracks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTracks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useImportTrack() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (track: TrackMetadata) => {
      if (!actor) throw new Error('Actor not available');
      return actor.importTrack(track);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
  });
}

export function useDeleteTrack() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTrack(trackId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
  });
}

export function useGetAllMixes() {
  const { actor, isFetching } = useActor();

  return useQuery<MixMetadata[]>({
    queryKey: ['mixes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMixes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveMix() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mix: MixMetadata) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveMix(mix);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mixes'] });
    },
  });
}

export function useGetStreamingLibraries() {
  const { actor, isFetching } = useActor();

  return useQuery<StreamingLibrary[]>({
    queryKey: ['streamingLibraries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStreamingLibraries();
    },
    enabled: !!actor && !isFetching,
  });
}
