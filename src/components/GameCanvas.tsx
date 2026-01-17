import { useEffect } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { Scoreboard } from './Scoreboard';
import { StartScreen } from './StartScreen';
import { GameOverScreen } from './GameOverScreen';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

export function GameCanvas() {
  const { gameState, canvasRef, startGame, pauseGame, setPlayerInput } = useGameLoop();

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game keys
      if (['ArrowUp', 'ArrowDown', 'w', 's', 'W', 'S', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setPlayerInput('up');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setPlayerInput('down');
      } else if (e.key === ' ') {
        if (gameState.status === 'idle' || gameState.status === 'gameover') {
          startGame();
        } else {
          pauseGame();
        }
      } else if (e.key === 'Escape') {
        pauseGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's', 'W', 'S'].includes(e.key)) {
        setPlayerInput(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.status, startGame, pauseGame, setPlayerInput]);

  // Get active power-up name for display
  const activePowerUp = gameState.playerPaddle.isExtended
    ? 'LONG PADDLE'
    : gameState.balls.some((b) => b.isGhost)
      ? 'GHOST BALL'
      : gameState.balls.length > 1
        ? 'DOUBLE BALL'
        : null;

  return (
    <div className="game-container">
      {/* Scoreboard */}
      {gameState.status === 'playing' && (
        <Scoreboard
          playerScore={gameState.playerScore}
          aiScore={gameState.aiScore}
          winningScore={gameState.winningScore}
          activePowerUp={activePowerUp}
        />
      )}

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-cyan-500/50 rounded-lg glow-cyan"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        {/* Start Screen Overlay */}
        {gameState.status === 'idle' && <StartScreen onStart={startGame} />}

        {/* Pause Overlay */}
        {gameState.status === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
            <h2 className="text-4xl font-bold text-cyan-400 neon-cyan mb-4">PAUSED</h2>
            <p className="text-gray-400">Press SPACE to continue</p>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState.status === 'gameover' && (
          <GameOverScreen
            winner={gameState.playerScore >= gameState.winningScore ? 'player' : 'ai'}
            playerScore={gameState.playerScore}
            aiScore={gameState.aiScore}
            onRestart={startGame}
          />
        )}
      </div>

      {/* Controls hint */}
      {gameState.status === 'playing' && (
        <div className="mt-4 text-gray-500 text-sm flex gap-4">
          <span>
            <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">W</kbd>
            {' / '}
            <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">S</kbd>
            {' Move'}
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">SPACE</kbd>
            {' Pause'}
          </span>
        </div>
      )}
    </div>
  );
}
