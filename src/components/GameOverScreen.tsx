interface GameOverScreenProps {
  winner: 'player' | 'ai';
  playerScore: number;
  aiScore: number;
  onRestart: () => void;
}

export function GameOverScreen({
  winner,
  playerScore,
  aiScore,
  onRestart,
}: GameOverScreenProps) {
  const isPlayerWinner = winner === 'player';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
      {/* Result */}
      <h2
        className={`text-5xl font-bold mb-4 ${
          isPlayerWinner ? 'text-cyan-400 neon-cyan' : 'text-red-400'
        }`}
        style={!isPlayerWinner ? { textShadow: '0 0 10px #ff0044, 0 0 20px #ff0044' } : undefined}
      >
        {isPlayerWinner ? 'VICTORY!' : 'GAME OVER'}
      </h2>

      {/* Score */}
      <div className="flex items-center gap-8 mb-8">
        <div className="text-center">
          <div className="text-cyan-400 text-sm uppercase tracking-wider mb-1">
            Player
          </div>
          <div className="text-cyan-300 text-4xl font-bold neon-cyan">
            {playerScore}
          </div>
        </div>

        <div className="text-gray-500 text-2xl">—</div>

        <div className="text-center">
          <div className="text-red-400 text-sm uppercase tracking-wider mb-1">
            AI
          </div>
          <div
            className="text-red-300 text-4xl font-bold"
            style={{ textShadow: '0 0 10px #ff0044, 0 0 20px #ff0044' }}
          >
            {aiScore}
          </div>
        </div>
      </div>

      {/* Message */}
      <p className="text-gray-400 mb-6 text-center max-w-xs">
        {isPlayerWinner
          ? 'You defeated the AI! Can you do it again?'
          : 'The AI was too fast this time. Try again!'}
      </p>

      {/* Restart Button */}
      <button
        onClick={onRestart}
        className="cyber-button"
      >
        Play Again
      </button>

      {/* Hint */}
      <p className="text-gray-600 text-sm mt-4">
        Press <kbd className="px-2 py-1 bg-gray-800 rounded">SPACE</kbd> to restart
      </p>
    </div>
  );
}
