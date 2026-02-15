"use client"

import { useRef, JSX } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import Selector from "./Selector"
import {
    useGLTF,
    ContactShadows,
    Environment,
} from "@react-three/drei"

import * as THREE from "three"
import ProductOverlay from "./ProductOverlay"

/**
 * Model3D Root Component
 */
export default function Model3D(): JSX.Element {

    return (
        <div className="relative w-full h-[600px]">

            <Canvas
                camera={{ position: [0, 0, 4], fov: 40 }}
                shadows
                dpr={[1, 2]}
            >


                <ambientLight intensity={0.7} />

                <spotLight
                    intensity={0.5}
                    angle={0.1}
                    penumbra={1}
                    position={[10, 15, -5]}
                    castShadow
                />

                <Environment preset="city" background blur={1} />

                <ContactShadows
                    resolution={512}
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

            <ProductOverlay />

        </div>
    )
}


/**
 * Shoe Component
 */
function Shoe(props: JSX.IntrinsicElements["group"]): JSX.Element {

    const ref = useRef<THREE.Group>(null!)

    const { nodes, materials } = useGLTF(
        "/3D/nike_air_zoom_pegasus_36-transformed.glb"
    ) as any

    useFrame((state) => {

        const t = state.clock.getElapsedTime()

        ref.current.rotation.set(
            Math.cos(t / 4) / 8,
            Math.sin(t / 3) / 4,
            0.15 + Math.sin(t / 2) / 8
        )

        ref.current.position.y =
            (0.5 + Math.cos(t / 2)) / 7
    })

    return (
        <group ref={ref} {...props}>

            <mesh
                receiveShadow
                castShadow
                geometry={nodes.defaultMaterial.geometry}
                material={materials.NikeShoe}
            />

        </group>
    )
}

/**
 * Preload model
 */
useGLTF.preload(
    "/3D/nike_air_zoom_pegasus_36-transformed.glb"
)
