"use client"

import { useRef, ReactNode } from "react"
import { useFrame } from "@react-three/fiber"
import { MeshTransmissionMaterial } from "@react-three/drei"
import { easing } from "maath"
import * as THREE from "three"

import { state, useStore } from "../../store/store"

export default function Selector({
    children,
}: {
    children: ReactNode
}) {

    const ref = useRef<THREE.Mesh>(null!)

    const snap = useStore()
    const open = snap.open

    useFrame(({ viewport, camera, pointer }, delta) => {

        if (!ref.current) return

        const { width, height } =
            viewport.getCurrentViewport(camera, [0, 0, 3])

        easing.damp3(
            ref.current.position,
            [(pointer.x * width) / 2, (pointer.y * height) / 2, 3],
            open ? 0 : 0.1,
            delta
        )

        easing.damp3(
            ref.current.scale,
            open ? 4 : 0.01,
            open ? 0.5 : 0.2,
            delta
        )

        easing.dampC(
            (ref.current.material as THREE.MeshPhysicalMaterial).color,
            open ? "#f0f0f0" : "#ccc",
            0.1,
            delta
        )

    })

    return (
        <>
            <mesh ref={ref}>

                <circleGeometry args={[1, 16]} />
                <MeshTransmissionMaterial
                    samples={4}
                    resolution={128}
                    anisotropicBlur={0.05}
                    thickness={0.1}
                    roughness={0.4}
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
