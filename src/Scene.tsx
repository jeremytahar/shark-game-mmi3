import { Environment, Plane, useKeyboardControls } from '@react-three/drei';
import { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { Shark } from './components/Shark';
import { Crab } from './components/Crab';
import { useFrame } from '@react-three/fiber';

const CRABS: [number, number, number][] = [
    [-8, 0.1, -8],
    [8, 0.1, -8],
    [-8, 0.1, 8],
    [8, 0.1, 8],
    [0, 0.1, -7],
    [-6, 0.1, 2],
    [6, 0.1, 2],
]

const ATTACK_RANGE = 1.5
const ATTACK_DELAY = 500
const CAMERA_DISTANCE = 7
const CAMERA_HEIGHT = 4
const MOUSE_SENSITIVITY = 0.003

type SceneProps = {
    onDefeat: (count: number) => void
}

export function Scene({ onDefeat }: SceneProps) {
    const directionalLightRef = useRef<THREE.DirectionalLight>(null!)
    const sharkRef = useRef<THREE.Group>(null!)
    const [, get] = useKeyboardControls()

    const planeSize = 20
    const boundaryLimit = planeSize / 2

    const [defeatedCrabs, setDefeatedCrabs] = useState<Set<number>>(new Set())

    const yaw = useRef(0)
    const pitch = useRef(-0.3)

    useEffect(() => {
        const canvas = document.querySelector('canvas')
        if (!canvas) return

        const handleClick = () => {
            canvas.requestPointerLock()
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (document.pointerLockElement !== canvas) return
            yaw.current -= e.movementX * MOUSE_SENSITIVITY
            pitch.current += e.movementY * MOUSE_SENSITIVITY
            pitch.current = THREE.MathUtils.clamp(pitch.current, -0.6, 0.8)
        }

        canvas.addEventListener('click', handleClick)
        window.addEventListener('mousemove', handleMouseMove)
        return () => {
            canvas.removeEventListener('click', handleClick)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    const defeatNearbyCrab = useCallback(() => {
        if (!sharkRef.current) return
        const sharkPos = sharkRef.current.position

        CRABS.forEach((position, index) => {
            setDefeatedCrabs((prev) => {
                if (prev.has(index)) return prev
                const dx = sharkPos.x - position[0]
                const dz = sharkPos.z - position[2]
                if (Math.sqrt(dx * dx + dz * dz) <= ATTACK_RANGE) {
                    const next = new Set(prev)
                    next.add(index)
                    onDefeat(next.size)
                    return next
                }
                return prev
            })
        })
    }, [onDefeat])

    useEffect(() => {
        const handlePointerDown = () => {
            setTimeout(defeatNearbyCrab, ATTACK_DELAY)
        }
        window.addEventListener('pointerdown', handlePointerDown)
        return () => window.removeEventListener('pointerdown', handlePointerDown)
    }, [defeatNearbyCrab])

    useFrame((state, delta) => {
        const { forward, back, left, right } = get()
        const speed = 5 * delta

        if (sharkRef.current) {
            const moveDir = new THREE.Vector3()

            if (forward) moveDir.z -= 1
            if (back) moveDir.z += 1
            if (left) moveDir.x -= 1
            if (right) moveDir.x += 1

            if (moveDir.length() > 0) {
                moveDir.normalize()
                moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current)

                sharkRef.current.position.x += moveDir.x * speed
                sharkRef.current.position.z += moveDir.z * speed

                const targetAngle = Math.atan2(moveDir.x, moveDir.z)
                const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle)
                sharkRef.current.quaternion.slerp(targetQuat, 10 * delta)
            }

            sharkRef.current.position.x = THREE.MathUtils.clamp(sharkRef.current.position.x, -boundaryLimit, boundaryLimit)
            sharkRef.current.position.z = THREE.MathUtils.clamp(sharkRef.current.position.z, -boundaryLimit, boundaryLimit)
            sharkRef.current.position.y = 0

            const sharkPos = sharkRef.current.position

            const camX = sharkPos.x + CAMERA_DISTANCE * Math.sin(yaw.current) * Math.cos(pitch.current)
            const camY = sharkPos.y + CAMERA_HEIGHT + CAMERA_DISTANCE * Math.sin(pitch.current)
            const camZ = sharkPos.z + CAMERA_DISTANCE * Math.cos(yaw.current) * Math.cos(pitch.current)

            state.camera.position.set(camX, camY, camZ)
            state.camera.lookAt(sharkPos)
        }
    })

    return (
        <>
            <Environment files="sky.jpg" background />

            <Shark ref={sharkRef} />

            {CRABS.map((position, index) => (
                <Crab
                    key={index}
                    position={position}
                    isBroken={defeatedCrabs.has(index)}
                />
            ))}

            <Plane
                args={[planeSize, planeSize]}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
            >
                <meshStandardMaterial color="#f0e68c" />
            </Plane>

            <ambientLight intensity={1} />
            <directionalLight
                ref={directionalLightRef}
                position={[0, 10, 5]}
                intensity={1.5}
                castShadow
            />
        </>
    )
}
