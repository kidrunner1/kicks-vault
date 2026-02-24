"use client"

import { JSX } from "react"
import { Canvas } from "@react-three/fiber"

import Selector from "./Selector"
import Shoe from "./Shoe"
import ProductOverlay from "./ProductOverlay"

import {
    ContactShadows,
    Environment,
    AdaptiveDpr,
    AdaptiveEvents,
} from "@react-three/drei"

export default function Model3D(): JSX.Element {

    return (

        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
            }}
        >

            {/* 3D Canvas Layer */}
            <Canvas
                camera={{ position: [0, 0, 4], fov: 40 }}
                dpr={[1, 1.5]}
                shadows
                style={{
                    position: "absolute",
                    inset: 0,
                }}
            >

                <AdaptiveDpr pixelated />
                <AdaptiveEvents />

                <ambientLight intensity={0.7} />

                <spotLight
                    intensity={0.5}
                    angle={0.1}
                    penumbra={1}
                    position={[10, 15, -5]}
                    castShadow
                />

                {/* lighter than city */}
                <Environment preset="city" background blur={1} />

                <ContactShadows
                    resolution={256}
                    position={[0, -0.8, 0]}
                    opacity={1}
                    scale={10}
                    blur={2}
                    far={0.8}
                />

                <Selector>
                    <Shoe rotation={[0.3, Math.PI / 1.6, 0]} />
                </Selector>

            </Canvas>

            {/* Overlay Layer */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 10,
                }}
            >
                <ProductOverlay />
            </div>

        </div>

    )
}
