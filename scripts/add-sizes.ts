import { prisma } from "@/lib/prisma"

async function main() {

  const shoeId = "d3246f12-4d15-4bc3-a412-c3033b48a5a2"

  const sizes = ["40", "41", "42", "43", "44", "45"]

  await prisma.shoeSize.createMany({
    data: sizes.map(size => ({
      shoeId,
      size,
      stock: 10
    })),
    skipDuplicates: true
  })

  console.log("Sizes added successfully")
}

main()
  .catch(e => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
