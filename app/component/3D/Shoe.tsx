"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

type GLTFResult = {
  nodes: {
    defaultMaterial: THREE.Mesh
  }
  materials: {
    NikeShoe: THREE.Material
  }
}

export default function Shoe(props: any) {

  const ref = useRef<THREE.Group>(null!)

  const { nodes, materials } =
    useGLTF(
      "/3D/nike_air_zoom_pegasus_36-transformed.glb"
    ) as unknown as GLTFResult

  useFrame((state) => {

    if (!ref.current) return

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
    <group ref={ref}>

      <mesh
        geometry={
          nodes.defaultMaterial.geometry
        }
        material={materials.NikeShoe}
        castShadow
        receiveShadow
        {...props}
      />

    </group>
  )
}

useGLTF.preload(
  "/3D/nike_air_zoom_pegasus_36-transformed.glb"
)
