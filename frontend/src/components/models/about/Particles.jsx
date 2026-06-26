import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Number of particles scattered around the model
const PARTICLE_COUNT = 80;

const Particles = () => {
    const groupRef = useRef();
    const pointsRef = useRef();

    // Generate random particle positions scattered around the Shaw model area
    const { positions, sizes } = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            // Scatter particles in a wide spherical shell around the model
            // Model is at roughly position [0.6, -3, 0] scaled to 2.3
            // We place particles in a torus-like distribution around the model
            const radius = 1.5 + Math.random() * 2.8;   // ring radius spread
            const theta = Math.random() * Math.PI * 2;   // horizontal angle
            const phi = (Math.random() - 0.5) * Math.PI; // vertical spread

            positions[i3] = radius * Math.cos(theta) * Math.cos(phi);
            positions[i3 + 1] = radius * Math.sin(phi) * 0.6; // flatten vertically
            positions[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

            // Random sizes for visual variety (very small particles)
            sizes[i] = 0.015 + Math.random() * 0.035;
        }

        return { positions, sizes };
    }, []);

    // Slowly spin the entire particle system
    useFrame(({ clock }) => {
        if (groupRef.current) {
            const t = clock.getElapsedTime();
            // Very very slow rotation — one full revolution in ~120 seconds
            groupRef.current.rotation.y = t * 0.052;
            // Subtle vertical oscillation on individual points
            groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.04;
        }

        // Pulsate point sizes for a twinkling effect
        if (pointsRef.current) {
            pointsRef.current.material.opacity =
                0.65 + Math.sin(clock.getElapsedTime() * 1.5) * 0.2;
        }
    });

    return (
        // Position the group to be centered around the Shaw model
        <group ref={groupRef} position={[0.6, -2.4, 0]}>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        array={positions}
                        count={PARTICLE_COUNT}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color="#ffffff"
                    size={0.06}
                    sizeAttenuation={true}
                    transparent={true}
                    opacity={0.8}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Slightly larger, softer glow layer for bloom effect */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        array={positions}
                        count={PARTICLE_COUNT}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color="#c8d8ff"
                    size={0.14}
                    sizeAttenuation={true}
                    transparent={true}
                    opacity={0.18}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    );
};

export default Particles;
