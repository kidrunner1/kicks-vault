"use client"

import { Canvas } from "@react-three/fiber"
import { Environment, ContactShadows } from "@react-three/drei"

import Shoe from "./Shoe"
import Selector from "./Selector"
import ProductOverlay from "./ProductOverlay"

interface Props {
  modelPath: string
}

export default function ModelViewer({ modelPath }: Props) {

  return (
    <div className="relative w-full h-full">

      <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>

        <ambientLight intensity={0.7} />

        <Environment preset="city" />

        <ContactShadows
          position={[0, -0.8, 0]}
          opacity={1}
          scale={10}
          blur={2}
        />

        <Selector>
          <Shoe modelPath={modelPath} />
        </Selector>

      </Canvas>

      <ProductOverlay />

    </div>
  )
}
