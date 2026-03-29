import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type TargetProps = {
    position: [number, number, number]
    isDestroyed: boolean
}

const poleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8)
const headGeometry = new THREE.SphereGeometry(0.2, 8, 8)
const targetMaterial = new THREE.MeshStandardMaterial({ color: '#e63946' })
const destroyedMaterial = new THREE.MeshStandardMaterial({ color: '#888888' })

export function Target({ position, isDestroyed }: TargetProps) {
    const groupRef = useRef<THREE.Group>(null!)
    const fallVelocity = useRef(0)
    const hasFallen = useRef(false)

    useFrame((_state, delta) => {
        if (!groupRef.current) return

        if (isDestroyed && !hasFallen.current) {
            fallVelocity.current += 15 * delta
            groupRef.current.rotation.z += fallVelocity.current * delta

            if (groupRef.current.rotation.z >= Math.PI / 2) {
                groupRef.current.rotation.z = Math.PI / 2
                hasFallen.current = true
            }
        }
    })

    const mat = isDestroyed ? destroyedMaterial : targetMaterial

    return (
        <group ref={groupRef} position={[position[0], position[1] + 0.6, position[2]]}>
            <mesh geometry={poleGeometry} material={mat} castShadow />
            <mesh geometry={headGeometry} material={mat} castShadow position={[0, 0.8, 0]} />
        </group>
    )
}
