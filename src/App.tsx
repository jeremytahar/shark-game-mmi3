import './App.css';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { useMemo, useState } from 'react';
import { KeyboardControls } from '@react-three/drei';
import { UI } from './components/UI';

const TOTAL_CRABS = 7

function App() {
  const [defeatedCount, setDefeatedCount] = useState(0)

  const map = useMemo(() => [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'back', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'attack', keys: ['KeyF'] },
  ], [])

  return (
    <div className='canvas-container'>
      <UI defeatedCount={defeatedCount} totalCount={TOTAL_CRABS} />
      <KeyboardControls map={map}>
        <Canvas
          shadows
          camera={{
            fov: 75,
            near: 0.1,
            far: 100,
            position: [0, 3, 6]
          }}
        >
          <Scene onDefeat={setDefeatedCount} />
        </Canvas>
      </KeyboardControls>
    </div>
  )
}

export default App
