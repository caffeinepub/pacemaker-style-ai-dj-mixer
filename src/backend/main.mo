import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type TrackId = Nat;
  public type MixId = Nat;
  public type Timestamp = Time.Time;

  public type TrackMetadata = {
    id : TrackId;
    title : Text;
    artist : Text;
    bpm : ?Nat;
    key : ?Text;
    energy : ?Nat;
    filePath : Text;
    importedAt : Timestamp;
  };

  public type MixMetadata = {
    id : MixId;
    title : Text;
    creator : Principal;
    tracks : [TrackId];
    duration : Nat;
    createdAt : Timestamp;
  };

  public type StreamingLibrary = {
    name : Text;
    placeholderConnected : Bool;
  };

  public type UserProfile = {
    name : Text;
  };

  public type DeckState = {
    currentTrack : ?TrackId;
    bpm : ?Nat;
    isPlaying : Bool;
  };

  public type SessionState = {
    leftDeck : DeckState;
    rightDeck : DeckState;
    isAutoMixing : Bool;
  };

  public type Genre = {
    #House;
    #Techno;
    #HipHop;
    #Pop;
    #Other;
  };

  public type Key = Text;

  public type SharingPreferences = {
    allowPublicAccess : Bool;
    allowDownload : Bool;
    shareExpiration : ?Timestamp;
  };

  module TrackMetadata {
    public func compareByBpm(x : TrackMetadata, y : TrackMetadata) : Order.Order {
      let bpm1 = switch (x.bpm) { case (null) { 0 }; case (?bpm) { bpm } };
      let bpm2 = switch (y.bpm) { case (null) { 0 }; case (?bpm) { bpm } };
      Nat.compare(bpm1, bpm2);
    };
  };

  module MixMetadata {
    public func compareByTimestamp(x : MixMetadata, y : MixMetadata) : Order.Order {
      Int.compare(x.createdAt, y.createdAt);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextTrackId : TrackId = 0;
  var nextMixId : MixId = 0;

  let usersTracks = Map.empty<Principal, Map.Map<TrackId, TrackMetadata>>();
  let usersMixes = Map.empty<Principal, Map.Map<MixId, MixMetadata>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let placeholderLibraries = Map.empty<Principal, List.List<StreamingLibrary>>();
  var nextUserId = 0;
  let userIds = Map.empty<Principal, Nat>();
  let userSharingPreferences = Map.empty<Principal, SharingPreferences>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Track Management Functions
  public query ({ caller }) func getAllTracks() : async [TrackMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tracks");
    };
    switch (usersTracks.get(caller)) {
      case (?tracks) {
        let tracksArray = tracks.values().toArray();
        tracksArray.sort(TrackMetadata.compareByBpm);
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getAllTracksForUser(user : Principal) : async [TrackMetadata] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tracks");
    };
    switch (usersTracks.get(user)) {
      case (?tracks) {
        tracks.values().toArray();
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func importTrack(track : TrackMetadata) : async TrackId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can import tracks");
    };

    let trackId = nextTrackId;
    nextTrackId += 1;

    let newTrack : TrackMetadata = {
      id = trackId;
      title = track.title;
      artist = track.artist;
      bpm = track.bpm;
      key = track.key;
      energy = track.energy;
      filePath = track.filePath;
      importedAt = Time.now();
    };

    let userTracks = switch (usersTracks.get(caller)) {
      case (?tracks) { tracks };
      case (null) {
        let newMap = Map.empty<TrackId, TrackMetadata>();
        usersTracks.add(caller, newMap);
        newMap;
      };
    };

    userTracks.add(trackId, newTrack);
    trackId;
  };

  public shared ({ caller }) func deleteTrack(trackId : TrackId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tracks");
    };

    switch (usersTracks.get(caller)) {
      case (?tracks) {
        tracks.remove(trackId);
      };
      case (null) {
        Runtime.trap("Track not found");
      };
    };
  };

  // Mix Management Functions
  public query ({ caller }) func getAllMixes() : async [MixMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mixes");
    };
    switch (usersMixes.get(caller)) {
      case (?mixes) {
        let mixesArray = mixes.values().toArray();
        mixesArray.sort(MixMetadata.compareByTimestamp);
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getAllMixesForUser(user : Principal) : async [MixMetadata] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own mixes");
    };
    switch (usersMixes.get(user)) {
      case (?mixes) {
        mixes.values().toArray();
      };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func saveMix(mix : MixMetadata) : async MixId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save mixes");
    };

    let mixId = nextMixId;
    nextMixId += 1;

    let newMix : MixMetadata = {
      id = mixId;
      title = mix.title;
      creator = caller;
      tracks = mix.tracks;
      duration = mix.duration;
      createdAt = Time.now();
    };

    let userMixes = switch (usersMixes.get(caller)) {
      case (?mixes) { mixes };
      case (null) {
        let newMap = Map.empty<MixId, MixMetadata>();
        usersMixes.add(caller, newMap);
        newMap;
      };
    };

    userMixes.add(mixId, newMix);
    mixId;
  };

  public shared ({ caller }) func deleteMix(mixId : MixId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete mixes");
    };

    switch (usersMixes.get(caller)) {
      case (?mixes) {
        mixes.remove(mixId);
      };
      case (null) {
        Runtime.trap("Mix not found");
      };
    };
  };

  // Deck and Session Functions
  public shared ({ caller }) func saveDeckState(deck : DeckState) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save deck state");
    };
  };

  public query ({ caller }) func calculateBpmAdjustment(track1Id : TrackId, track2Id : TrackId) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate BPM adjustments");
    };

    let (track1, _) = getTrackByIdInternal(caller, track1Id);
    let (track2, _) = getTrackByIdInternal(caller, track2Id);

    switch (track1.bpm, track2.bpm) {
      case (?bpm1, ?bpm2) {
        let adjustment = Int.abs(bpm1 - bpm2);
        ?Int.abs(adjustment);
      };
      case (_) { null };
    };
  };

  // Streaming Library Functions
  public query ({ caller }) func getStreamingLibraries() : async [StreamingLibrary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view streaming libraries");
    };
    switch (placeholderLibraries.get(caller)) {
      case (?libraries) { libraries.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func connectToStreamingLibrary(library : StreamingLibrary) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can connect to streaming libraries");
    };

    let existingLibraries = switch (placeholderLibraries.get(caller)) {
      case (?libs) { libs };
      case (null) { List.empty<StreamingLibrary>() };
    };

    let newLibrary : StreamingLibrary = {
      name = library.name;
      placeholderConnected = true;
    };
    existingLibraries.add(newLibrary);
    placeholderLibraries.add(caller, existingLibraries);
  };

  // Sharing Preferences Functions
  public shared ({ caller }) func setSharingPreferences(preferences : SharingPreferences) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set sharing preferences");
    };
    userSharingPreferences.add(caller, preferences);
  };

  public query ({ caller }) func getSharingPreferences(user : Principal) : async ?SharingPreferences {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own sharing preferences");
    };
    userSharingPreferences.get(user);
  };

  // Utility Functions
  public query ({ caller }) func ping() : async Timestamp {
    Time.now();
  };

  func getTrackByIdInternal(user : Principal, trackId : TrackId) : (TrackMetadata, TrackMetadata) {
    switch (usersTracks.get(user)) {
      case (?tracks) {
        switch (tracks.get(trackId)) {
          case (?track) { (track, track) };
          case (null) { Runtime.trap("Track not found") };
        };
      };
      case (null) { Runtime.trap("Track not found") };
    };
  };
};
