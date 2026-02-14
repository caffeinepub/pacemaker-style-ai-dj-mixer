import { useState, useEffect, useRef } from 'react';
import { AudioEngine } from '../../lib/audio/AudioEngine';
import { MixRecorder } from '../../lib/audio/recording';
import DeckPanel from './DeckPanel';
import Crossfader from './Crossfader';
import AiControls from './AiControls';
import ReactiveBackdrop from './ReactiveBackdrop';
import MixerHeader from './MixerHeader';
import LibraryDrawer from '../library/LibraryDrawer';
import MixHistoryDrawer from '../history/MixHistoryDrawer';
import SettingsDrawer from '../settings/SettingsDrawer';
import RecordingControls from './RecordingControls';
import { useDjMode } from '../../hooks/useDjMode';
import type { LocalTrack } from '../../hooks/useTrackLibrary';
import type { AnalysisResult } from '../../lib/analysis/trackAnalysis';

export interface LoadedTrack extends LocalTrack {
  analysis: AnalysisResult;
}

export default function MixerScreen() {
  const { mode } = useDjMode();
  const [engine] = useState(() => new AudioEngine());
  const [recorder] = useState(() => new MixRecorder());
  
  const [deckATrack, setDeckATrack] = useState<LoadedTrack | null>(null);
  const [deckBTrack, setDeckBTrack] = useState<LoadedTrack | null>(null);
  
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [targetDeck, setTargetDeck] = useState<'A' | 'B' | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      engine.dispose();
    };
  }, [engine]);

  const handleLoadTrack = (track: LoadedTrack, deck: 'A' | 'B') => {
    if (track.audioBuffer) {
      engine.loadTrack(deck, track.audioBuffer);
      if (deck === 'A') {
        setDeckATrack(track);
      } else {
        setDeckBTrack(track);
      }
      
      // Auto-sync in beginner mode
      if (mode === 'beginner' && deckATrack && deckBTrack) {
        const otherTrack = deck === 'A' ? deckBTrack : deckATrack;
        const otherDeck = deck === 'A' ? 'B' : 'A';
        
        if (otherTrack.analysis && track.analysis) {
          const rate = track.analysis.bpm / otherTrack.analysis.bpm;
          engine.setPlaybackRate(otherDeck, rate);
        }
      }
    }
  };

  const handleOpenLibrary = (deck: 'A' | 'B') => {
    setTargetDeck(deck);
    setLibraryOpen(true);
  };

  const handleStartRecording = () => {
    const stream = engine.startRecording();
    recorder.start(stream);
    setIsRecording(true);
    setRecordingDuration(0);
    
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const handleStopRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    const blob = await recorder.stop();
    engine.stopRecording();
    setIsRecording(false);
    
    return blob;
  };

  return (
    <div className="relative h-full w-full flex flex-col">
      <ReactiveBackdrop engine={engine} />
      
      <MixerHeader
        onOpenLibrary={() => setLibraryOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
        <DeckPanel
          deck="A"
          track={deckATrack}
          engine={engine}
          onLoadTrack={() => handleOpenLibrary('A')}
        />

        <Crossfader engine={engine} />

        <DeckPanel
          deck="B"
          track={deckBTrack}
          engine={engine}
          onLoadTrack={() => handleOpenLibrary('B')}
        />

        <AiControls
          engine={engine}
          deckATrack={deckATrack}
          deckBTrack={deckBTrack}
        />

        <RecordingControls
          isRecording={isRecording}
          duration={recordingDuration}
          onStart={handleStartRecording}
          onStop={handleStopRecording}
          deckATrack={deckATrack}
          deckBTrack={deckBTrack}
        />
      </div>

      <LibraryDrawer
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        targetDeck={targetDeck}
        onLoadTrack={handleLoadTrack}
      />

      <MixHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />

      <SettingsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}
