import { useRef, useEffect, useMemo, forwardRef } from 'react'
import { useGLTF, useAnimations, useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
    nodes: {
        Cube001: THREE.SkinnedMesh
        Sharky: THREE.SkinnedMesh
        Root: THREE.Bone
    }
    materials: {
        AtlasMaterial: THREE.MeshBasicMaterial
    }
    animations: THREE.AnimationClip[]
}

export const Shark = forwardRef<THREE.Group, React.ComponentProps<'group'>>((props, ref) => {
    const group = useRef<THREE.Group>(null!)
    const { nodes, materials, animations } = useGLTF('/models/Sharky.glb') as unknown as GLTFResult

    useEffect(() => {
        if (ref) {
            if (typeof ref === 'function') ref(group.current)
            else (ref as React.MutableRefObject<THREE.Group | null>).current = group.current
        }
    }, [ref])

    useMemo(() => {
        animations.forEach((clip) => {
            if (clip.name.includes('Idle')) clip.name = 'Repos'
            if (clip.name.includes('Walk')) clip.name = 'Walk'
        })
    }, [animations])

    const { actions } = useAnimations(animations, group)
    const currentAnimationRef = useRef<string>('Repos')

    const [, get] = useKeyboardControls()

    useEffect(() => {
        const idleAction = actions['Repos']
        if (idleAction) {
            idleAction.reset().fadeIn(0.3).play()
        }
    }, [actions])

    useFrame(() => {
        const { forward, back, left, right } = get()
        const isMoving = forward || back || left || right
        const targetAnimation = isMoving ? 'Walk' : 'Repos'

        if (currentAnimationRef.current !== targetAnimation) {
            const prevAction = actions[currentAnimationRef.current]
            const nextAction = actions[targetAnimation]

            if (prevAction) prevAction.fadeOut(0.3)
            if (nextAction) nextAction.reset().fadeIn(0.3).play()

            currentAnimationRef.current = targetAnimation
        }
    })

    return (
        <group ref={group} {...props} dispose={null}>
            <group name="Root_Scene">
                <group name="RootNode">
                    <group name="CharacterArmature" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                        <primitive object={nodes.Root} />
                    </group>
                    <skinnedMesh
                        name="Cube001"
                        geometry={nodes.Cube001.geometry}
                        material={materials.AtlasMaterial}
                        castShadow
                        skeleton={nodes.Cube001.skeleton}
                        rotation={[-Math.PI / 2, 0, 0]}
                        scale={100}
                    />
                    <skinnedMesh
                        name="Sharky"
                        geometry={nodes.Sharky.geometry}
                        material={materials.AtlasMaterial}
                        castShadow
                        skeleton={nodes.Sharky.skeleton}
                        rotation={[-Math.PI / 2, 0, 0]}
                        scale={100}
                    />
                </group>
            </group>
        </group>
    )
})

useGLTF.preload('/models/Sharky.glb')