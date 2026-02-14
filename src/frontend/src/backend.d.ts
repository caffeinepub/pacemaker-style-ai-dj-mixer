import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface SharingPreferences {
    shareExpiration?: Timestamp;
    allowPublicAccess: boolean;
    allowDownload: boolean;
}
export type MixId = bigint;
export interface TrackMetadata {
    id: TrackId;
    bpm?: bigint;
    key?: string;
    title: string;
    importedAt: Timestamp;
    filePath: string;
    artist: string;
    energy?: bigint;
}
export type TrackId = bigint;
export interface MixMetadata {
    id: MixId;
    title: string;
    creator: Principal;
    duration: bigint;
    tracks: Array<TrackId>;
    createdAt: Timestamp;
}
export interface StreamingLibrary {
    name: string;
    placeholderConnected: boolean;
}
export interface UserProfile {
    name: string;
}
export interface DeckState {
    bpm?: bigint;
    currentTrack?: TrackId;
    isPlaying: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateBpmAdjustment(track1Id: TrackId, track2Id: TrackId): Promise<bigint | null>;
    connectToStreamingLibrary(library: StreamingLibrary): Promise<void>;
    deleteMix(mixId: MixId): Promise<void>;
    deleteTrack(trackId: TrackId): Promise<void>;
    getAllMixes(): Promise<Array<MixMetadata>>;
    getAllMixesForUser(user: Principal): Promise<Array<MixMetadata>>;
    getAllTracks(): Promise<Array<TrackMetadata>>;
    getAllTracksForUser(user: Principal): Promise<Array<TrackMetadata>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSharingPreferences(user: Principal): Promise<SharingPreferences | null>;
    getStreamingLibraries(): Promise<Array<StreamingLibrary>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    importTrack(track: TrackMetadata): Promise<TrackId>;
    isCallerAdmin(): Promise<boolean>;
    ping(): Promise<Timestamp>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDeckState(deck: DeckState): Promise<void>;
    saveMix(mix: MixMetadata): Promise<MixId>;
    setSharingPreferences(preferences: SharingPreferences): Promise<void>;
}
