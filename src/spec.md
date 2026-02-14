# Specification

## Summary
**Goal:** Build a mobile-first, dual-deck AI-assisted DJ mixer with client-side track analysis, gesture-driven controls, reactive neon visuals, recording/export, and lightweight backend metadata persistence.

**Planned changes:**
- Create a phone-friendly core mixing screen with two decks, scrolling waveforms, BPM/key/progress readouts, loop/cue controls, and an audible crossfader.
- Add audio import from local files and a clearly labeled placeholder “connect streaming library” flow (UI + data model) without third-party OAuth.
- Implement client-side track analysis on load: BPM estimate, key detection, waveform data generation, energy metric, and a simple structure timeline (intro/verse/drop/outro) shown in the deck UI.
- Add touch/pointer gesture interactions: swipe-to-crossfade, pinch-to-filter, tap-to-trigger FX, press-and-hold looping, and circular motion for EQ/FX modulation with visual feedback.
- Implement core mixing + AI-assist features: tempo sync/beatmatching, one-tap “AI Transition”, recommendations ranked by key/BPM/energy, and an auto-mix mode that sequences tracks and transitions.
- Add per-deck performance tools: LPF/HPF, echo, reverb, beat repeat (quantized subdivisions), quantized looping, and multiple hot cues.
- Apply a dark, minimal neon-accented visual theme with smooth rhythmic motion; make waveforms and at least one background/accent element react to audio frequency/intensity.
- Add onboarding and mode selection: Beginner mode (sync-on + guardrails) and Pro mode (full manual control), with a settings toggle.
- Support client-side recording of the mixed output into a single audio file, with export/download and a mix history view.
- Implement backend persistence (single Motoko main actor) for user-scoped track metadata (including analysis results) and recorded mix session metadata, exposed via frontend-accessible methods.
- Add and use generated static images (app icon + background texture + DJ icon set) from `frontend/public/assets/generated`.

**User-visible outcome:** Users can import tracks, see analyzed BPM/key/waveform/structure, mix two decks with gestures and effects, use sync/AI transition/recommendations/auto-mix, record and download a mixed file, and view saved library/session metadata with a consistent reactive neon UI.
