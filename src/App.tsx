import { GameCanvas } from './components/GameCanvas';

function App() {
  return (
    <div className="min-h-screen cyber-grid scanlines flex flex-col items-center justify-center p-4">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-wider">
        <span className="text-cyan-400 neon-cyan">CYBER</span>
        <span className="text-fuchsia-400 neon-magenta">-PONG</span>
        <span className="text-yellow-400 neon-yellow text-2xl ml-2">2026</span>
      </h1>

      {/* Game */}
      <GameCanvas />

      {/* Footer */}
      <div className="mt-8 text-gray-600 text-xs">
        Built with React + TypeScript + Canvas
      </div>
    </div>
  );
}

export default App;
