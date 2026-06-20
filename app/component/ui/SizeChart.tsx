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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      <div className="mb-10">
        <h3 className="text-2xl font-semibold tracking-tight">
          คู่มือไซซ์ {brand && `- ${brand}`}
        </h3>
        <p className="text-sm text-black/50 mt-2 max-w-xl">
          ใช้ตารางนี้เทียบไซซ์ก่อนสั่งซื้อ หากอยู่กึ่งกลางระหว่างสองไซซ์
          แนะนำให้เลือกไซซ์ใหญ่ขึ้นเพื่อความสบาย
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">

        <table className="w-full text-sm">
          <thead className="bg-black/5">
            <tr className="text-black/60">
              <th className="text-left py-4 px-6 font-medium">US</th>
              <th className="text-left py-4 px-6 font-medium">EU</th>
              <th className="text-left py-4 px-6 font-medium">CM</th>
            </tr>
          </thead>

          <tbody>
            {sizeData.map((size, index) => (
              <tr
                key={size.us}
                className={`
                  border-t border-black/5
                  ${index % 2 === 0 ? "bg-white" : "bg-black/[0.02]"}
                  hover:bg-black/5
                  transition
                `}
              >
                <td className="py-4 px-6">{size.us}</td>
                <td className="py-4 px-6">{size.eu}</td>
                <td className="py-4 px-6">{size.cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-12">

        <div>
          <h4 className="font-medium mb-3">
            วิธีวัดเท้า
          </h4>
          <ol className="text-sm text-black/60 space-y-2 leading-relaxed list-decimal list-inside">
            <li>วางเท้าบนพื้นเรียบ</li>
            <li>วัดจากส้นเท้าถึงปลายนิ้วที่ยาวที่สุด</li>
            <li>นำความยาวที่ได้ไปเทียบกับคอลัมน์ CM</li>
          </ol>
        </div>

        <div>
          <h4 className="font-medium mb-3">
            คำแนะนำการเลือกไซซ์
          </h4>
          <p className="text-sm text-black/60 leading-relaxed">
            รองเท้าแต่ละรุ่นตั้งใจให้ใส่ได้ตามไซซ์มาตรฐาน
            หากชอบทรงหลวมหรือใส่ถุงเท้าหนา
            ลองเพิ่มครึ่งไซซ์เพื่อให้เดินสบายขึ้น
          </p>
        </div>

      </div>

      <div className="mt-12 border-t border-black/10 pt-6 text-xs text-black/60">
        ไซซ์จริงอาจต่างกันเล็กน้อยตามรุ่นและ collection
      </div>

    </motion.div>
  )
}
