import { prisma } from "@/lib/prisma"


async function main() {

  const brand = await prisma.brand.create({
    data: {
      name: "Nike",
      slug: "nike"
    }
  })

  console.log(brand)

}

main()
