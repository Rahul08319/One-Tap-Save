import { useRef, useState, useEffect } from 'react';
import { useGameEngine } from './useGameEngine';
import { GameCanvas } from './GameCanvas';
import { HUD } from './HUD';
import { DiveControls } from './DiveControls';
import { MenuScreen } from './MenuScreen';
import { GameOverScreen } from './GameOverScreen';
import { Confetti } from './Confetti';
import { TutorialOverlay, shouldShowTutorial } from './TutorialOverlay';
import { StadiumLights } from './StadiumLights';
import { getDailyRoundCount } from './dailyChallenge';
import {
  applyYouTubeLanguage,
  getCurrentPlatform,
  getInitialAudioEnabled,
  logPlayablesError,
  notifyFirstFrameReady,
  notifyGameReady,
  onYouTubeAudioEnabledChange,
  onYouTubePause,
  onYouTubeResume,
  restoreGameData,
} from './youtubePlayables';
import { setGameAudioEnabled } from './sounds';
import { getAccessibilitySettings, saveAccessibilitySettings } from './accessibility';
import { GLOVES, getPlayerProfile } from './playerProgress';
import { ApplePauseModal } from './ApplePauseModal';
import { AppleReviveModal } from './AppleReviveModal';

export function GoalkeeperGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 700 });
  const [showTutorial, setShowTutorial] = useState(shouldShowTutorial());
  const [profile, setProfile] = useState(getPlayerProfile());

  const {
    gameState, score, ballDirection, diveDirection, saved,
    ballProgress, diveProgress, difficulty, selectedDifficulty,
    screenShake, showConfetti, isNewHighScore,
    comboMultiplier, showCombo, totalPoints,
    gameMode, activePowerUp, showPowerUp,
    isPaused, showReviveModal,
    startGame, handleDive, pauseGame, resumeGame,
    reviveWithAd, dismissRevive,
  } = useGameEngine();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      notifyFirstFrameReady();
      notifyGameReady();
    });
    void restoreGameData();
    void applyYouTubeLanguage();
    setGameAudioEnabled(getInitialAudioEnabled());
    saveAccessibilitySettings(getAccessibilitySettings());
    const stopAudioListener = onYouTubeAudioEnabledChange(setGameAudioEnabled);
    const stopPauseListener = onYouTubePause(pauseGame);
    const stopResumeListener = onYouTubeResume(resumeGame);
    const onError = () => logPlayablesError();
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onError);
    const refreshProfile = () => setProfile(getPlayerProfile());
    window.addEventListener('otg-profile-change', refreshProfile);
    return () => {
      cancelAnimationFrame(frame);
      stopAudioListener();
      stopPauseListener();
      stopResumeListener();
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onError);
      window.removeEventListener('otg-profile-change', refreshProfile);
    };
  }, [pauseGame, resumeGame]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Keep canvas crisp while capping pixel density to avoid excess memory
        // on high-density tablets and ultrawide screens.
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        setDimensions({
          width: Math.max(1, Math.floor(rect.width * dpr)),
          height: Math.max(1, Math.floor(rect.height * dpr)),
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateSize);\n    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      mode: gameState,
      paused: isPaused,
      score,
      ball: { direction: ballDirection, progress: ballProgress },
      dive: { direction: diveDirection, progress: diveProgress },
      coordinateSystem: 'screen origin top-left; x increases right, y increases down',
    });
    return () => { delete window.render_game_to_text; };
  }, [gameState, isPaused, score, ballDirection, ballProgress, diveDirection, diveProgress]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'f') {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void containerRef.current?.requestFullscreen?.();
        return;
      }
      if (event.key.toLowerCase() === 'p' || event.key === 'Escape') {
        if (gameState === 'shooting' || gameState === 'result' || gameState === 'ready') {
          if (isPaused) resumeGame();
          else pauseGame();
        }
        return;
      }
      if (gameState !== 'shooting' || isPaused || showReviveModal) return;
      const direction = event.key === 'ArrowLeft' ? 'left' : event.key === 'ArrowRight' ? 'right' : event.key === 'ArrowUp' || event.key === ' ' ? 'center' : null;
      if (direction) {
        event.preventDefault();
        handleDive(direction);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, isPaused, showReviveModal, handleDive, pauseGame, resumeGame]);

  const handleStart = (diff: any, mode?: any) => {
    if (showTutorial) {
      setShowTutorial(false);
    }
    startGame(diff, mode);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[100dvh] min-h-[320px] overflow-hidden bg-background ${screenShake ? 'animate-screen-shake' : ''}`}
    >
      <StadiumLights />

      {/* Apple Pause Modal */}
      {isPaused && (\n        <ApplePauseModal
          saves={score.saves}
          streak={score.streak}
          onResume={resumeGame}
          onRestart={() => {
            resumeGame();
            startGame();
          }}
        />
      )}

      {/* Apple Rewarded Ad Second Chance Modal */}
      {showReviveModal && (
        <AppleReviveModal
          saves={score.saves}
          streak={score.bestStreak}
          onRevive={reviveWithAd}
          onDismiss={dismissRevive}
        />
      )}

      <GameCanvas
        ballDirection={ballDirection}
        diveDirection={diveDirection}
        ballProgress={ballProgress}
        diveProgress={diveProgress}
        saved={saved}
        width={dimensions.width}
        height={dimensions.height}
        gloveColor={GLOVES[profile.selectedGlove].color}
      />

      <Confetti active={showConfetti} />

      {(gameState === 'shooting' || gameState === 'result' || gameState === 'ready') && (
        <>
          <HUD
            score={score}
            difficulty={difficulty}
            comboMultiplier={comboMultiplier}
            showCombo={showCombo}
            totalPoints={totalPoints}
            activePowerUp={activePowerUp}
            showPowerUp={showPowerUp}
            isDaily={gameMode === 'daily'}
            dailyRounds={getDailyRoundCount()}
            onPauseClick={pauseGame}
            platformName={getCurrentPlatform()}
          />
          <DiveControls onDive={handleDive} gameState={gameState} />
        </>
      )}

      {gameState === 'menu' && !showTutorial && <MenuScreen onStart={handleStart} />}
      {gameState === 'menu' && showTutorial && (
        <TutorialOverlay onDismiss={() => setShowTutorial(false)} />
      )}
      {gameState === 'gameover' && (
        <GameOverScreen
          score={score}
          onRestart={() => startGame()}
          isNewHighScore={isNewHighScore}
          difficulty={selectedDifficulty}
          totalPoints={totalPoints}
          isDaily={gameMode === 'daily'}
        />
      )}

      {(gameState === 'shooting' || gameState === 'result' || gameState === 'ready') && (
        <div className="absolute bottom-[36%] left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 transition-all ${
                i < score.goals
                  ? 'bg-accent border-accent shadow-[0_0_10px_rgba(255,59,48,0.7)]'
                  : 'border-muted-foreground/30 bg-transparent'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
