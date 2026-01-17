interface ScoreboardProps {
  playerScore: number;
  aiScore: number;
  winningScore: number;
  activePowerUp?: string | null;
}

export function Scoreboard({
  playerScore,
  aiScore,
  winningScore,
  activePowerUp,
}: ScoreboardProps) {
  return (
    <div className="flex justify-between items-center w-full max-w-[800px] mb-4 px-4">
      {/* Player Score */}
      <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-lg border-2 border-cyan-400/50 glow-cyan">
        <div className="text-cyan-400 text-xs uppercase tracking-widest mb-1">
          Player
        </div>
        <div className="text-cyan-300 text-4xl font-bold neon-cyan">
          {playerScore}
        </div>
      </div>

      {/* Center - Game Info */}
      <div className="text-center flex flex-col items-center">
        <div className="text-gray-500 text-sm mb-1">First to {winningScore}</div>

        {/* Active Power-Up Indicator */}
        {activePowerUp && (
          <div className="mt-2 px-3 py-1 bg-fuchsia-900/50 border border-fuchsia-500/50 rounded-full pulse-glow">
            <span className="text-fuchsia-400 text-xs uppercase tracking-wide neon-magenta">
              {activePowerUp}
            </span>
          </div>
        )}
      </div>

      {/* AI Score */}
      <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-lg border-2 border-red-400/50 glow-red">
        <div className="text-red-400 text-xs uppercase tracking-widest mb-1">AI</div>
        <div className="text-red-300 text-4xl font-bold" style={{
          textShadow: '0 0 10px #ff0044, 0 0 20px #ff0044'
        }}>
          {aiScore}
        </div>
      </div>
    </div>
  );
}
