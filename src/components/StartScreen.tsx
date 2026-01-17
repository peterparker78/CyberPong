interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
      {/* Title */}
      <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-wider">
        <span className="text-cyan-400 neon-cyan">CYBER</span>
        <span className="text-fuchsia-400 neon-magenta">-PONG</span>
      </h1>
      <span className="text-yellow-400 neon-yellow text-2xl mb-8">2026</span>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="cyber-button mb-8"
      >
        Start Game
      </button>

      {/* Instructions */}
      <div className="text-gray-400 text-sm space-y-2 text-center">
        <p>
          <kbd className="px-2 py-1 bg-gray-800 rounded">W</kbd> /{' '}
          <kbd className="px-2 py-1 bg-gray-800 rounded">S</kbd> or{' '}
          <kbd className="px-2 py-1 bg-gray-800 rounded">Arrow Keys</kbd> to move
        </p>
        <p>
          <kbd className="px-2 py-1 bg-gray-800 rounded">SPACE</kbd> to pause
        </p>
      </div>

      {/* Power-up Legend */}
      <div className="mt-8 text-xs text-gray-500 space-y-1">
        <p className="text-center mb-2 text-gray-400">Power-Ups</p>
        <div className="flex gap-4">
          <span className="text-green-400">Long Paddle</span>
          <span className="text-yellow-400">Double Ball</span>
          <span className="text-purple-400">Ghost Ball</span>
        </div>
      </div>
    </div>
  );
}
