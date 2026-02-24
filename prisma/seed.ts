import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {

  console.log("🌱 Seeding started...")

  // ---------- Brands ----------
  const nike = await prisma.brand.upsert({
    where: { slug: "nike" },
    update: {},
    create: {
      name: "Nike",
      slug: "nike"
    }
  })

  const adidas = await prisma.brand.upsert({
    where: { slug: "adidas" },
    update: {},
    create: {
      name: "Adidas",
      slug: "adidas"
    }
  })

  const nb = await prisma.brand.upsert({
    where: { slug: "new-balance" },
    update: {},
    create: {
      name: "New Balance",
      slug: "new-balance"
    }
  })

  // ---------- Shoes ----------
  const shoes = [
    {
      name: "Air Max Phantom",
      slug: "air-max-phantom",
      description: "Minimal silhouette. Engineered comfort.",
      price: "12990",
      brandId: nike.id,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
    },
    {
      name: "Air Force Shadow",
      slug: "air-force-shadow",
      description: "Street icon reinvented.",
      price: "10990",
      brandId: nike.id,
      image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb"
    },
    {
      name: "Ultraboost Mono",
      slug: "ultraboost-mono",
      description: "Precision comfort for everyday motion.",
      price: "11990",
      brandId: adidas.id,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5"
    },
    {
      name: "Gazelle Heritage",
      slug: "gazelle-heritage",
      description: "Timeless suede classic.",
      price: "8990",
      brandId: adidas.id,
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77"
    },
    {
      name: "990v6 Shadow Grey",
      slug: "990v6-shadow-grey",
      description: "Crafted precision. Premium comfort.",
      price: "14990",
      brandId: nb.id,
      image: "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5"
    },
    {
      name: "2002R Lunar",
      slug: "2002r-lunar",
      description: "Retro-futuristic performance.",
      price: "11990",
      brandId: nb.id,
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3"
    }
  ]

  for (const shoe of shoes) {
    await prisma.shoe.upsert({
      where: { slug: shoe.slug },
      update: {},
      create: {
        name: shoe.name,
        slug: shoe.slug,
        description: shoe.description,
        price: new Prisma.Decimal(shoe.price),
        brandId: shoe.brandId,

        images: {
          create: [
            {
              url: shoe.image,
              order: 1
            }
          ]
        },

        sizes: {
          create: [
            { size: "40", stock: 5 },
            { size: "41", stock: 8 },
            { size: "42", stock: 3 }
          ]
        }
      }
    })

    console.log(`✔ Created: ${shoe.name}`)
  }

  console.log("✅ Seeding finished.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ SEED ERROR:", e)
    await prisma.$disconnect()
    process.exit(1)
  })