import './App.css';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { useMemo } from 'react';
import { KeyboardControls } from '@react-three/drei';


function App() {
  const map = useMemo(() => [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'back', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
  ], [])

  return (
    <div className='canvas-container'>
      <KeyboardControls map={map}>
        <Canvas
          shadows
          camera={{
            fov: 75,
            near: 0.1,
            far: 100,
            position: [0, 7, 5]
          }}
        >
          <Scene />
        </Canvas>
      </KeyboardControls>
    </div >
  )
}

export default App
