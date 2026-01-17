# CYBER-PONG 2026

A high-intensity, cyberpunk-themed Pong game built with Vite, React, TypeScript, and Canvas.

## Project Structure

```
src/
├── types/game.ts       # TypeScript interfaces for all game entities
├── constants/index.ts  # Game configuration (speeds, sizes, durations)
├── hooks/useGameLoop.ts # Core game loop and state management
├── engine/
│   ├── physics.ts      # Ball physics, velocity, reflections
│   ├── collision.ts    # AABB + circle collision detection
│   ├── ai.ts           # Adaptive AI with reaction delay
│   └── powerups.ts     # Power-up spawning and effects
├── rendering/
│   ├── canvas.ts       # Main render orchestration
│   ├── particles.ts    # Particle trail system
│   └── effects.ts      # Screen shake, glitch effects
└── components/
    ├── GameCanvas.tsx  # Canvas wrapper with input handling
    ├── Scoreboard.tsx  # Score display UI
    ├── StartScreen.tsx # Title and start menu
    └── GameOverScreen.tsx
```

## Game Rules

### Scoring
- First to 11 points wins
- Player controls left paddle (cyan)
- AI controls right paddle (red)

### Controls
- **W** or **Arrow Up**: Move paddle up
- **S** or **Arrow Down**: Move paddle down
- **Space**: Start game / Pause

### Power-Ups

Power-ups spawn every 8-13 seconds in the center area.

| Power-Up | Icon Color | Effect | Duration |
|----------|------------|--------|----------|
| Long Paddle | Green | Extends player paddle by 50% | 10 seconds |
| Double Ball | Yellow | Spawns second ball | Until scored |
| Ghost Ball | Purple | Ball ignores paddle collisions | 1 second |

### AI Difficulty Scaling

The AI adapts to the player's skill:
- **Base reaction delay**: 200ms
- **Delay reduction per player point**: 15ms
- **Minimum delay**: 50ms
- **Speed increase per point**: +15%

Formula: `aiDifficulty = 1 + (playerScore * 0.15)`

## Physics

### Ball Movement
- Delta-time normalized to 60fps (deltaTime / 16.67ms)
- Speed accelerates 5% on each paddle hit
- Maximum speed capped at 15 units/frame

### Paddle Reflection
- Hit position on paddle (-1 to +1) determines reflection angle
- Maximum angle: ±60° from horizontal
- Center hits = straight, edge hits = sharp angles

## Visual Effects

### Screen Shake
- Triggered on wall bounces
- Intensity: 8 pixels, Duration: 150ms
- Decaying intensity over duration

### Particle Trails
- Last 10 ball positions stored
- Rendered with decreasing opacity and size
- Color matches ball state (normal/ghost)

### Glitch Effect
- Triggered when a point is scored
- Duration: 300ms
- Horizontal slice displacement + RGB channel separation

## Development Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

## Implementation Progress

- [x] Project setup (Vite + React + TypeScript)
- [x] Tailwind CSS with cyberpunk theme
- [x] Directory structure
- [x] Type definitions
- [x] Game constants
- [x] useGameLoop hook
- [x] Physics engine
- [x] Collision detection
- [x] AI controller
- [x] Power-up system
- [x] Rendering system
- [x] React components
- [x] Visual effects
- [x] Build verification
