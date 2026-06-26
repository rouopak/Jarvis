import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { F1_model } from "./Mer_f1";

const Car = () => {
    const carRef = useRef();

    useFrame((state) => {
        if (!carRef.current) return;

        // Subtle mouse tracking
        const targetX = -1.2 - state.mouse.y * 0.08;
        const targetY = state.mouse.x * 0.15;

        carRef.current.rotation.x +=
            (targetX - carRef.current.rotation.x) * 0.04;

        carRef.current.rotation.y +=
            (targetY - carRef.current.rotation.y) * 0.04;

        // Floating animation
        carRef.current.position.y =
            -0.7 + Math.sin(state.clock.elapsedTime * 1.2) * 0.03;
    });

    return (
        <group
            ref={carRef}
            scale={0.029}
            position={[0, -0.7, -2]}
            rotation={[-1.2, 0, 0]}
        >
            <F1_model />
        </group>
    );
};

const CarModel = () => {
    return (
        <Canvas
            camera={{ position: [0, 0, 14], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{
                antialias: false,
                powerPreference: "high-performance",
                alpha: true,
            }}
        >
            {/* Ambient Fill */}
            <ambientLight
                intensity={0.6}
                color="#ffffff"
            />

            {/* Top Light */}
            <directionalLight
                position={[0, 4, -2]}
                intensity={1.5}
                color="#ffd9b3"
            />

            {/* Front Light */}
            <directionalLight
                position={[0, -4, 17]}
                intensity={2}
                color="#ffd9b3"
            />

            {/* Side Rim Light */}
            <directionalLight
                position={[8, 2, 4]}
                intensity={0.8}
                color="#00d4ff"
            />

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate={false}
            />

            <Car />
        </Canvas>
    );
};

export default CarModel;