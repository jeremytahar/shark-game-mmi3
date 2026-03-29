import { useGLTF } from '@react-three/drei'

type CrabProps = {
    position: [number, number, number]
    isBroken: boolean
}

export function Crab({ position, isBroken }: CrabProps) {
    const { scene } = useGLTF('/models/Crab.glb')

    return (
        <primitive
            object={scene.clone()}
            position={position}
            scale={isBroken ? 0 : 0.05}
            dispose={null}
        />
    )
}

useGLTF.preload('/models/Crab.glb')
