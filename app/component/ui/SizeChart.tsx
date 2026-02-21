"use client"

import { motion } from "framer-motion"

interface SizeChartProps {
  brand?: string
}

const sizeData = [
  { us: "6", eu: "39", cm: "24.5" },
  { us: "7", eu: "40", cm: "25.0" },
  { us: "8", eu: "41", cm: "26.0" },
  { us: "9", eu: "42", cm: "27.0" },
  { us: "10", eu: "43", cm: "28.0" },
  { us: "11", eu: "44", cm: "29.0" },
]

export default function SizeChart({ brand }: SizeChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
        mt-10
        border border-white/10
        rounded-2xl
        p-8
        bg-white/2
      "
    >
      <div className="mb-6">
        <h3 className="text-xl tracking-tight">
          Size Chart {brand && `— ${brand}`}
        </h3>
        <p className="text-sm text-white/40 mt-1">
          Please refer to the measurements below before selecting your size.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="text-left py-3">US</th>
              <th className="text-left py-3">EU</th>
              <th className="text-left py-3">CM</th>
            </tr>
          </thead>

          <tbody>
            {sizeData.map((size) => (
              <tr
                key={size.us}
                className="
                  border-b border-white/5
                  hover:bg-white/3
                  transition
                "
              >
                <td className="py-3">{size.us}</td>
                <td className="py-3">{size.eu}</td>
                <td className="py-3">{size.cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </motion.div>
  )
}