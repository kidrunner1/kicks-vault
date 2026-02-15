import { useGLTF } from "@react-three/drei"

export default function Shoe({ modelPath }: { modelPath: string }) {

  const { scene } = useGLTF(modelPath)

  return (
    <primitive object={scene} scale={1.5} />
  )
}
