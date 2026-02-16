import { prisma } from "../lib/prisma"

async function main() {

    const nike = await prisma.brand.upsert({
    where: { slug: "nike" },
    update: {},
    create: {
      name: "Nike",
      slug: "nike"
    }
  })

  await prisma.shoe.create({

    data: {

      name: "Air Max 90",
      slug: "air-max-90",

      description:
        "Classic running silhouette with modern comfort.",

      featured: true,

      brandId: nike.id,

      images: {
        create: [
          {
            url: "/images/shoes/nike-02.jpg",
            order: 0
          }
        ]
      },

      specs: {
        create: [
          { label: "Weight", value: "390g" },
          { label: "Material", value: "Mesh + Leather" },
          { label: "Category", value: "Running" }
        ]
      }

    }

  })

}

main()
