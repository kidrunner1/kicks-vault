"use client"

import { useRef, useMemo } from "react"
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

  const gltf =
    useGLTF("/3D/nike_air_zoom_pegasus_36-transformed.glb") as unknown as GLTFResult

  const { nodes, materials } = gltf

  // Cache geometry (important)
  const geometry = useMemo(
    () => nodes.defaultMaterial.geometry,
    [nodes]
  )

  useFrame((state) => {

    if (!ref.current) return

    const t = state.clock.elapsedTime

    ref.current.rotation.x =
      Math.cos(t / 4) / 8

    ref.current.rotation.y =
      Math.sin(t / 3) / 4

    ref.current.rotation.z =
      0.15 + Math.sin(t / 2) / 8

    ref.current.position.y =
      (0.5 + Math.cos(t / 2)) / 7

  })

  return (

    <group ref={ref}>

      <mesh
        geometry={geometry}
        material={materials.NikeShoe}
        castShadow={false}
        receiveShadow={false}
        {...props}
      />

    </group>

  )

}

useGLTF.preload(
  "/3D/nike_air_zoom_pegasus_36-transformed.glb"
)