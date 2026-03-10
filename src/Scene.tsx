import { Environment, OrbitControls, Plane, useKeyboardControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import { Perf } from 'r3f-perf';
import { Shark } from './components/Shark';
import { useFrame } from '@react-three/fiber';

export function Scene() {
    const directionalLightRef = useRef<THREE.DirectionalLight>(null!);
    const sharkRef = useRef<THREE.Group>(null!);
    const [, get] = useKeyboardControls();

    // Vecteurs pour les calculs de rotation
    const rotationAxis = new THREE.Vector3(0, 1, 0);
    const targetQuaternion = new THREE.Quaternion();


    useFrame((state, delta) => {
        const { forward, back, left, right } = get();
        const isMoving = forward || back || left || right;
        const speed = 5 * delta;

        if (sharkRef.current) {
            // 1. DÉPLACEMENT (Translation)
            // On déplace le groupe dans le monde
            if (forward) sharkRef.current.position.z -= speed;
            if (back) sharkRef.current.position.z += speed;
            if (left) sharkRef.current.position.x -= speed;
            if (right) sharkRef.current.position.x += speed;

            // 2. ANTI-VOL (Gravité forcée)
            // On force le requin à rester au sol à chaque frame
            sharkRef.current.position.y = 0;

            // 3. ROTATION FLUIDE (Quaternion Slerp)
            if (isMoving) {
                // Calcul de l'angle cible en fonction des touches
                let angle = 0;

                // On détermine l'angle vers lequel regarder
                if (forward) angle = Math.PI; // Dos à la caméra (vers -Z)
                if (back) angle = 0;       // Face à la caméra (vers +Z)
                if (left) angle = -Math.PI / 2;
                if (right) angle = Math.PI / 2;

                // Gestion des diagonales pour une orientation précise
                if (forward && left) angle = -Math.PI * 0.75;
                if (forward && right) angle = Math.PI * 0.75;
                if (back && left) angle = -Math.PI * 0.25;
                if (back && right) angle = Math.PI * 0.25;

                // On prépare la rotation cible
                targetQuaternion.setFromAxisAngle(rotationAxis, angle);

                // On tourne doucement le requin vers la cible (Slerp)
                sharkRef.current.quaternion.slerp(targetQuaternion, 10 * delta);
            }
        }
    });

    return (
        <>
            <Perf position="top-left" />
            <OrbitControls />
            <Environment files="sky.jpg" background />

            {/* On passe la ref pour que la Scène puisse contrôler le Requin */}
            <Shark ref={sharkRef} />

            <Plane
                args={[30, 30]}
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
    );
}