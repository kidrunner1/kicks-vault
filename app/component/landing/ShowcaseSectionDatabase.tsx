"use client"

import {
  motion,
  useScroll,
  useTransform,
  useSpring
} from "framer-motion"

import {
  useRef,
  useEffect,
  useState
} from "react"

interface Shoe {
  id: string
  name: string
  description: string
  images: { url: string }[]
  specs: { id: string; label: string; value: string }[]
  brand: { name: string }
}

export default function ShowcaseSectionDatabase() {

  const ref = useRef<HTMLDivElement>(null)

  const [shoes, setShoes] = useState<Shoe[]>([])
  const [mounted, setMounted] = useState(false)

  // fetch data
  useEffect(() => {

    fetch("/api/shoes")
      .then(res => res.json())
      .then(result => {

        // รองรับทั้ง array และ {data: array}
        const shoesArray = Array.isArray(result)
          ? result
          : result.data

        setShoes(shoesArray)

      })

  }, [])


  // mount guard
  useEffect(() => {
    setMounted(true)
  }, [])

  // ALWAYS call hooks (no conditions)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  })

  const smooth = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20
  })

  const x = useTransform(
    smooth,
    [0, 1],
    ["0%", `-${Math.max(shoes.length - 1, 0) * 100}%`]
  )

  return (

    <section
      ref={ref}
      className="h-[400vh] bg-black relative"
    >

      <div className="sticky top-0 h-screen overflow-hidden">

        <motion.div
          style={{ x }}
          className="flex h-full items-center"
        >

          {!mounted && (

            <div className="text-white m-auto">
              Loading...
            </div>

          )}

          {mounted && shoes.map((shoe) => (

            <div
              key={shoe.id}
              className="
                min-w-screen
                h-full
                flex
                items-center
                justify-center
                text-white
              "
            >

              <img
                src={shoe.images[0]?.url}
                className="
                  w-[500px]
                  rounded-xl
                  shadow-2xl
                "
              />

              <div className="ml-20 max-w-md">

                <div className="text-gray-400 text-sm">
                  {shoe.brand.name}
                </div>

                <h2 className="
                  text-6xl
                  font-[var(--font-bebas)]
                ">
                  {shoe.name}
                </h2>

                <p className="mt-4 text-gray-300">
                  {shoe.description}
                </p>

              </div>

            </div>

          ))}

        </motion.div>

      </div>

    </section>

  )
}
