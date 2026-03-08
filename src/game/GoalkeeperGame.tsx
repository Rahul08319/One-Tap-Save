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

export function GoalkeeperGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 700 });
  const [showTutorial, setShowTutorial] = useState(shouldShowTutorial());

  const {
    gameState, score, ballDirection, diveDirection, saved,
    ballProgress, diveProgress, difficulty, selectedDifficulty,
    screenShake, showConfetti, isNewHighScore,
    comboMultiplier, showCombo, totalPoints,
    gameMode, activePowerUp, showPowerUp,
    startGame, handleDive,
  } = useGameEngine();

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        setDimensions({
          width: Math.floor(rect.width * dpr),
          height: Math.floor(rect.height * dpr),
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleStart = (diff: any, mode?: any) => {
    if (showTutorial) {
      setShowTutorial(false);
    }
    startGame(diff, mode);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden bg-background ${screenShake ? 'animate-screen-shake' : ''}`}
    >
      <StadiumLights />

      <GameCanvas
        ballDirection={ballDirection}
        diveDirection={diveDirection}
        ballProgress={ballProgress}
        diveProgress={diveProgress}
        saved={saved}
        width={dimensions.width}
        height={dimensions.height}
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
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 ${
                i < score.goals
                  ? 'bg-accent border-accent'
                  : 'border-muted-foreground/30 bg-transparent'
              }`}
              style={i < score.goals ? { boxShadow: 'var(--glow-accent)' } : {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
