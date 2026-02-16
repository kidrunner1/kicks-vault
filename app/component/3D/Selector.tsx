"use client"

import { useRef, ReactNode, JSX } from "react"
import { useFrame } from "@react-three/fiber"
import { MeshTransmissionMaterial } from "@react-three/drei"
import { easing } from "maath"
import * as THREE from "three"

import { state, useStore } from "../../store/store"

interface SelectorProps {
    children: ReactNode
}

export default function Selector({ children }: SelectorProps): JSX.Element {

    const ref = useRef<THREE.Mesh>(null!)
    const store = useStore()

    useFrame(({ viewport, camera, pointer }, delta) => {

        const { width, height } =
            viewport.getCurrentViewport(camera, [0, 0, 3])

        easing.damp3(
            ref.current.position,
            [(pointer.x * width) / 2, (pointer.y * height) / 2, 3],
            store.open ? 0 : 0.1,
            delta
        )

        easing.damp3(
            ref.current.scale,
            store.open ? 4 : 0.01,
            store.open ? 0.5 : 0.2,
            delta
        )

        easing.dampC(
            (ref.current.material as THREE.MeshPhysicalMaterial).color,
            store.open ? "#f0f0f0" : "#ccc",
            0.1,
            delta
        )
    })

    return (
        <>
            <mesh ref={ref}>
                <circleGeometry args={[1, 64]} />

                <MeshTransmissionMaterial
                    samples={16}
                    resolution={512}
                    anisotropicBlur={0.1}
                    thickness={0.1}
                    roughness={0.4}
                    toneMapped
                />
            </mesh>

            <group
                onPointerOver={() => (state.open = true)}
                onPointerOut={() => (state.open = false)}
                onPointerDown={() => (state.open = true)}
                onPointerUp={() => (state.open = false)}
            >
                {children}
            </group>
        </>
    )
}
