import { useRef, useEffect, useMemo, useState, forwardRef } from 'react'
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
            const name = clip.name
            if (name.includes('Death')) clip.name = 'Mort'
            else if (name.includes('Run')) clip.name = 'Courir'
            else if (name.includes('Walk')) clip.name = 'Marcher'
            else if (name.includes('Jump_Idle')) clip.name = 'Sauter'
            else if (name.includes('Idle')) clip.name = 'Repos'
            else if (name.includes('Sword')) clip.name = 'Attaquer'
        })
        console.log(animations.map((clip) => clip.name))
    }, [animations])

    const { actions, mixer } = useAnimations(animations, group)
    const [animation, setAnimation] = useState('Repos')
    const previousAnimationRef = useRef<string>('Repos')
    const isAttacking = useRef(false)

    const yVelocity = useRef(0)
    const isJumping = useRef(false)
    const gravity = -20
    const jumpForce = 8

    const [, get] = useKeyboardControls()

    useEffect(() => {
        const handleClick = () => {
            isAttacking.current = true
            setAnimation('Attaquer')
        }
        window.addEventListener('pointerdown', handleClick)
        return () => window.removeEventListener('pointerdown', handleClick)
    }, [])

    useEffect(() => {
        const onFinished = (e: THREE.Event) => {
            const event = e as unknown as { action: THREE.AnimationAction }
            if (event.action === actions['Attaquer']) {
                isAttacking.current = false
            }
        }
        mixer.addEventListener('finished', onFinished)
        return () => mixer.removeEventListener('finished', onFinished)
    }, [mixer, actions])

    useFrame((_state, delta) => {
        const { forward, back, left, right, jump, attack } = get()
        const isMoving = forward || back || left || right

        if (jump && !isJumping.current) {
            yVelocity.current = jumpForce
            isJumping.current = true
        }

        if (attack && !isAttacking.current) {
            isAttacking.current = true
            setAnimation('Attaquer')
        }

        if (isJumping.current) {
            yVelocity.current += gravity * delta
            group.current.position.y += yVelocity.current * delta

            if (group.current.position.y <= 0) {
                group.current.position.y = 0
                yVelocity.current = 0
                isJumping.current = false
            }
        }

        if (!isAttacking.current) {
            let targetAnimation = 'Repos'

            if (isJumping.current) {
                targetAnimation = 'Sauter'
            } else if (isMoving) {
                targetAnimation = 'Marcher'
            }

            if (animation !== targetAnimation) {
                setAnimation(targetAnimation)
            }
        }
    })

    useEffect(() => {
        Object.entries(actions).forEach(([name, action]) => {
            if (!action) return
            if (name === 'Sauter' || name === 'Attaquer') {
                action.setLoop(THREE.LoopOnce, 1)
                action.clampWhenFinished = true
            } else {
                action.setLoop(THREE.LoopRepeat, Infinity)
                action.clampWhenFinished = false
            }
        })
    }, [actions])

    useEffect(() => {
        const action = actions[animation]
        const previousAction = actions[previousAnimationRef.current]

        if (!action) return

        action.reset().setEffectiveTimeScale(1).setEffectiveWeight(1)

        if (previousAction && previousAction !== action) {
            action.crossFadeFrom(previousAction, 0.2, true)
        }

        action.play()
        previousAnimationRef.current = animation
    }, [animation, actions])

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