import { Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type BrandSlug =
  | "nike"
  | "jordan"
  | "adidas"
  | "new-balance"
  | "puma"
  | "converse"
  | "asics"
  | "vans"

interface ShoeSeed {
  name: string
  slug: string
  description: string
  price: string
  brand: BrandSlug
  featured?: boolean
  images: string[]
  specs: {
    label: string
    value: string
  }[]
  sizes: {
    size: string
    stock: number
  }[]
}

const brands: {
  name: string
  slug: BrandSlug
  logo?: string
}[] = [
  { name: "Nike", slug: "nike", logo: "/images/shoes/nike.png" },
  { name: "Jordan", slug: "jordan", logo: "/images/shoes/nike-icon.png" },
  { name: "Adidas", slug: "adidas", logo: "/images/shoes/adidas.png" },
  { name: "New Balance", slug: "new-balance" },
  { name: "Puma", slug: "puma", logo: "/images/shoes/Puma-icon.jpg" },
  { name: "Converse", slug: "converse", logo: "/images/shoes/convers-icon.jpg" },
  { name: "ASICS", slug: "asics" },
  { name: "Vans", slug: "vans" },
]

const imagePool = [
  "/images/shoes/nike-01.jpg",
  "/images/shoes/nike-02.jpg",
  "/images/shoes/nike-03.jpg",
  "/images/shoes/nike-04.jpg",
  "/images/shoes/nike-05.jpg",
  "/images/shoes/nike-06.jpg",
  "/images/shoes/nike-07.jpg",
  "/images/shoes/nike-09.jpg",
  "/images/shoes/nike-10.jpg",
  "/images/shoes/nike-11.jpg",
  "/images/shoes/adidas-01.jpg",
]

const sizeSets = {
  men: [
    { size: "40", stock: 8 },
    { size: "41", stock: 11 },
    { size: "42", stock: 7 },
    { size: "43", stock: 4 },
    { size: "44", stock: 2 },
  ],
  women: [
    { size: "36", stock: 6 },
    { size: "37", stock: 9 },
    { size: "38", stock: 12 },
    { size: "39", stock: 7 },
    { size: "40", stock: 3 },
  ],
  kids: [
    { size: "28", stock: 5 },
    { size: "29", stock: 7 },
    { size: "30", stock: 4 },
    { size: "31", stock: 6 },
    { size: "32", stock: 2 },
  ],
  limited: [
    { size: "40", stock: 1 },
    { size: "41", stock: 2 },
    { size: "42", stock: 0 },
    { size: "43", stock: 1 },
    { size: "44", stock: 0 },
  ],
  soldOut: [
    { size: "40", stock: 0 },
    { size: "41", stock: 0 },
    { size: "42", stock: 0 },
    { size: "43", stock: 0 },
  ],
}

function specs(style: string, cushion: string, upper: string, fit: string) {
  return [
    { label: "Style", value: style },
    { label: "Cushion", value: cushion },
    { label: "Upper", value: upper },
    { label: "Fit", value: fit },
  ]
}

function images(startIndex: number) {
  return [
    imagePool[startIndex % imagePool.length],
    imagePool[(startIndex + 3) % imagePool.length],
  ]
}

const shoes: ShoeSeed[] = [
  {
    name: "Air Max Phantom",
    slug: "air-max-phantom",
    description: "A clean Air Max profile built for everyday rotation with soft cushioning and a sculpted street shape.",
    price: "12990",
    brand: "nike",
    featured: true,
    images: images(0),
    specs: specs("Lifestyle", "Air Max", "Mesh and synthetic overlays", "True to size"),
    sizes: sizeSets.men,
  },
  {
    name: "Air Force Shadow",
    slug: "air-force-shadow",
    description: "A layered court classic with a lifted stance, durable leather panels, and a crisp monochrome finish.",
    price: "10990",
    brand: "nike",
    featured: true,
    images: images(1),
    specs: specs("Lifestyle", "Foam midsole", "Leather", "Roomy toe box"),
    sizes: sizeSets.women,
  },
  {
    name: "Dunk Low Citrus Vault",
    slug: "dunk-low-citrus-vault",
    description: "A low-cut Dunk with bright archive color blocking and padded comfort for daily wear.",
    price: "9990",
    brand: "nike",
    images: images(2),
    specs: specs("Skate", "Cupsole foam", "Leather and suede", "Snug"),
    sizes: sizeSets.men,
  },
  {
    name: "Pegasus Night Run",
    slug: "pegasus-night-run",
    description: "A lightweight running pair tuned for breathable miles and clean late-night styling.",
    price: "8790",
    brand: "nike",
    images: images(3),
    specs: specs("Running", "Responsive foam", "Engineered mesh", "True to size"),
    sizes: sizeSets.women,
  },
  {
    name: "Blazer Mid Archive Cream",
    slug: "blazer-mid-archive-cream",
    description: "Vintage basketball lines with a mid-cut collar, suede texture, and neutral archive palette.",
    price: "9290",
    brand: "nike",
    images: images(4),
    specs: specs("Basketball", "Rubber cupsole", "Suede and canvas", "Narrow"),
    sizes: sizeSets.limited,
  },
  {
    name: "Jordan Retro Court Red",
    slug: "jordan-retro-court-red",
    description: "A bold retro court silhouette with structured support and collector-focused color blocking.",
    price: "16990",
    brand: "jordan",
    featured: true,
    images: images(5),
    specs: specs("Basketball", "Air cushioning", "Premium leather", "True to size"),
    sizes: sizeSets.men,
  },
  {
    name: "Jordan 1 Low Smoke",
    slug: "jordan-1-low-smoke",
    description: "Low-profile Jordan energy with soft smoke tones and an easy everyday fit.",
    price: "11990",
    brand: "jordan",
    images: images(6),
    specs: specs("Lifestyle", "Encapsulated Air", "Leather", "True to size"),
    sizes: sizeSets.women,
  },
  {
    name: "Jordan Max Aura Kids",
    slug: "jordan-max-aura-kids",
    description: "A kid-ready court-inspired pair with durable panels and cushioned support for active days.",
    price: "6990",
    brand: "jordan",
    images: images(7),
    specs: specs("Kids", "Soft foam", "Synthetic leather", "Secure fit"),
    sizes: sizeSets.kids,
  },
  {
    name: "Jordan Flight Vintage",
    slug: "jordan-flight-vintage",
    description: "A heritage flight design with a padded collar and archive-inspired construction.",
    price: "13990",
    brand: "jordan",
    images: images(8),
    specs: specs("Basketball", "Air unit", "Leather and textile", "True to size"),
    sizes: sizeSets.limited,
  },
  {
    name: "Ultraboost Mono Core",
    slug: "ultraboost-mono-core",
    description: "Energy-return comfort with a clean knit upper designed for long everyday movement.",
    price: "11990",
    brand: "adidas",
    featured: true,
    images: images(10),
    specs: specs("Running", "Boost", "Primeknit", "Sock-like fit"),
    sizes: sizeSets.men,
  },
  {
    name: "Gazelle Heritage Green",
    slug: "gazelle-heritage-green",
    description: "A suede terrace classic with low-profile comfort and timeless three-stripe character.",
    price: "8990",
    brand: "adidas",
    images: images(9),
    specs: specs("Lifestyle", "Rubber midsole", "Suede", "True to size"),
    sizes: sizeSets.women,
  },
  {
    name: "Samba Black Gum",
    slug: "samba-black-gum",
    description: "Iconic indoor football DNA, gum outsole grip, and a black leather finish.",
    price: "9290",
    brand: "adidas",
    images: images(8),
    specs: specs("Lifestyle", "Low-profile foam", "Leather", "Narrow"),
    sizes: sizeSets.limited,
  },
  {
    name: "Forum Low Chalk Blue",
    slug: "forum-low-chalk-blue",
    description: "A strapped court staple with soft chalk tones and everyday support.",
    price: "9790",
    brand: "adidas",
    images: images(7),
    specs: specs("Basketball", "EVA midsole", "Leather", "True to size"),
    sizes: sizeSets.men,
  },
  {
    name: "Superstar Kids Classic",
    slug: "superstar-kids-classic",
    description: "A shell-toe classic scaled for kids with durable comfort and easy styling.",
    price: "4990",
    brand: "adidas",
    images: images(6),
    specs: specs("Kids", "Rubber shell toe", "Synthetic leather", "Roomy"),
    sizes: sizeSets.kids,
  },
  {
    name: "990v6 Shadow Grey",
    slug: "990v6-shadow-grey",
    description: "Crafted comfort with premium grey materials and a stable runner-inspired shape.",
    price: "14990",
    brand: "new-balance",
    featured: true,
    images: images(5),
    specs: specs("Running", "FuelCell", "Mesh and suede", "True to size"),
    sizes: sizeSets.men,
  },
  {
    name: "2002R Lunar Mist",
    slug: "2002r-lunar-mist",
    description: "Retro-futuristic paneling with soft cushioning and a versatile lunar palette.",
    price: "11990",
    brand: "new-balance",
    images: images(4),
    specs: specs("Lifestyle", "ABZORB", "Mesh and suede", "True to size"),
    sizes: sizeSets.women,
  },
  {
    name: "530 Silver Coast",
    slug: "530-silver-coast",
    description: "A lightweight retro runner with metallic overlays and breathable mesh.",
    price: "7990",
    brand: "new-balance",
    images: images(3),
    specs: specs("Running", "ABZORB", "Mesh", "True to size"),
    sizes: sizeSets.men,
  },
  {
    name: "550 Team Navy",
    slug: "550-team-navy",
    description: "A collegiate court profile with sturdy panels and classic navy blocking.",
    price: "9990",
    brand: "new-balance",
    images: images(2),
    specs: specs("Basketball", "Rubber cupsole", "Leather", "Roomy"),
    sizes: sizeSets.limited,
  },
  {
    name: "327 Kids Split Tone",
    slug: "327-kids-split-tone",
    description: "A playful wedge runner for kids with bold split tones and easy comfort.",
    price: "4590",
    brand: "new-balance",
    images: images(1),
    specs: specs("Kids", "EVA foam", "Nylon and suede", "Secure fit"),
    sizes: sizeSets.kids,
  },
  {
    name: "Puma Suede Classic Black",
    slug: "puma-suede-classic-black",
    description: "Soft suede, clean side stripe, and a low-profile shape that has stayed relevant for decades.",
    price: "6290",
    brand: "puma",
    images: images(0),
    specs: specs("Lifestyle", "Rubber midsole", "Suede", "True to size"),
    sizes: sizeSets.men,
  },
  {
    name: "Puma Palermo Terrace",
    slug: "puma-palermo-terrace",
    description: "Terrace-inspired color blocking with a slim vintage profile and soft suede finish.",
    price: "6790",
    brand: "puma",
    images: images(10),
    specs: specs("Lifestyle", "Rubber midsole", "Suede", "Narrow"),
    sizes: sizeSets.women,
  },
  {
    name: "Puma RS-X Future",
    slug: "puma-rsx-future",
    description: "Chunky retro-tech lines with energetic cushioning and bold layered panels.",
    price: "8890",
    brand: "puma",
    images: images(9),
    specs: specs("Training", "RS foam", "Mesh and synthetic", "True to size"),
    sizes: sizeSets.men,
  },
  {
    name: "Puma Rider Kids Pop",
    slug: "puma-rider-kids-pop",
    description: "A bright kids runner with lightweight panels and soft underfoot cushioning.",
    price: "3990",
    brand: "puma",
    images: images(8),
    specs: specs("Kids", "EVA foam", "Textile and suede", "Secure fit"),
    sizes: sizeSets.kids,
  },
  {
    name: "Chuck 70 High Natural",
    slug: "chuck-70-high-natural",
    description: "A premium canvas high-top with classic sidewall texture and heritage details.",
    price: "5890",
    brand: "converse",
    images: images(7),
    specs: specs("Lifestyle", "OrthoLite", "Canvas", "Narrow"),
    sizes: sizeSets.men,
  },
  {
    name: "Chuck Taylor Lift White",
    slug: "chuck-taylor-lift-white",
    description: "Platform canvas style with everyday comfort and a crisp elevated stance.",
    price: "5490",
    brand: "converse",
    images: images(6),
    specs: specs("Lifestyle", "OrthoLite", "Canvas", "True to size"),
    sizes: sizeSets.women,
  },
  {
    name: "Run Star Hike Mono",
    slug: "run-star-hike-mono",
    description: "A statement platform profile with jagged outsole geometry and a monochrome build.",
    price: "7190",
    brand: "converse",
    images: images(5),
    specs: specs("Lifestyle", "OrthoLite", "Canvas", "Roomy"),
    sizes: sizeSets.limited,
  },
  {
    name: "One Star Academy",
    slug: "one-star-academy",
    description: "A low-cut suede classic with skate energy and a clean star side mark.",
    price: "5990",
    brand: "converse",
    images: images(4),
    specs: specs("Skate", "CX foam", "Suede", "True to size"),
    sizes: sizeSets.men,
  },
  {
    name: "ASICS Gel-Kayano 14 Cream",
    slug: "asics-gel-kayano-14-cream",
    description: "Technical runner lines, gel cushioning, and layered mesh for archive performance style.",
    price: "12990",
    brand: "asics",
    featured: true,
    images: images(3),
    specs: specs("Running", "GEL", "Mesh and synthetic", "True to size"),
    sizes: sizeSets.men,
  },
  {
    name: "ASICS Gel-NYC Graphite",
    slug: "asics-gel-nyc-graphite",
    description: "A hybrid runner with city-ready tones and stable cushioning.",
    price: "10990",
    brand: "asics",
    images: images(2),
    specs: specs("Lifestyle", "GEL", "Mesh and suede", "True to size"),
    sizes: sizeSets.women,
  },
  {
    name: "ASICS Japan S Kids",
    slug: "asics-japan-s-kids",
    description: "Court-inspired kids style with a smooth upper and lightweight comfort.",
    price: "3690",
    brand: "asics",
    images: images(1),
    specs: specs("Kids", "EVA foam", "Synthetic leather", "Secure fit"),
    sizes: sizeSets.kids,
  },
  {
    name: "ASICS Gel-Lyte III Mint",
    slug: "asics-gel-lyte-iii-mint",
    description: "Split-tongue retro runner with mint accents and soft suede texture.",
    price: "8990",
    brand: "asics",
    images: images(0),
    specs: specs("Running", "GEL", "Suede and mesh", "Snug"),
    sizes: sizeSets.limited,
  },
  {
    name: "Vans Old Skool Black White",
    slug: "vans-old-skool-black-white",
    description: "The original side-stripe skate shoe with durable canvas and suede panels.",
    price: "4290",
    brand: "vans",
    images: images(10),
    specs: specs("Skate", "Waffle outsole", "Canvas and suede", "True to size"),
    sizes: sizeSets.men,
  },
  {
    name: "Vans Sk8-Hi Vintage",
    slug: "vans-sk8-hi-vintage",
    description: "A high-top skate icon with padded ankle support and vintage side-stripe contrast.",
    price: "4990",
    brand: "vans",
    images: images(9),
    specs: specs("Skate", "Waffle outsole", "Canvas and suede", "True to size"),
    sizes: sizeSets.women,
  },
  {
    name: "Vans Authentic Kids Navy",
    slug: "vans-authentic-kids-navy",
    description: "A simple low-top canvas pair for kids with flexible grip and easy styling.",
    price: "2990",
    brand: "vans",
    images: images(8),
    specs: specs("Kids", "Waffle outsole", "Canvas", "Secure fit"),
    sizes: sizeSets.kids,
  },
  {
    name: "Vans Knu Skool Puff",
    slug: "vans-knu-skool-puff",
    description: "Oversized skate padding with a chunky lace profile and soft retro character.",
    price: "5790",
    brand: "vans",
    images: images(7),
    specs: specs("Skate", "Waffle outsole", "Suede", "Roomy"),
    sizes: sizeSets.limited,
  },
  {
    name: "Nike Calm Slide Vault",
    slug: "nike-calm-slide-vault",
    description: "A recovery slide with soft foam and a minimal profile for after-session comfort.",
    price: "2590",
    brand: "nike",
    images: images(6),
    specs: specs("Recovery", "Soft foam", "Molded synthetic", "Relaxed"),
    sizes: sizeSets.soldOut,
  },
]

async function main() {
  console.log("Seeding started...")

  const brandBySlug = new Map<BrandSlug, string>()

  for (const brand of brands) {
    const savedBrand = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        logo: brand.logo ?? null,
      },
      create: {
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
      },
    })

    brandBySlug.set(brand.slug, savedBrand.id)
  }

  for (const shoe of shoes) {
    const brandId = brandBySlug.get(shoe.brand)

    if (!brandId) {
      throw new Error(`Missing brand for ${shoe.name}`)
    }

    await prisma.shoe.upsert({
      where: { slug: shoe.slug },
      update: {
        name: shoe.name,
        description: shoe.description,
        price: new Prisma.Decimal(shoe.price),
        featured: shoe.featured ?? false,
        brandId,
        images: {
          deleteMany: {},
          create: shoe.images.map((url, index) => ({
            url,
            order: index,
          })),
        },
        specs: {
          deleteMany: {},
          create: shoe.specs,
        },
        sizes: {
          deleteMany: {},
          create: shoe.sizes,
        },
      },
      create: {
        name: shoe.name,
        slug: shoe.slug,
        description: shoe.description,
        price: new Prisma.Decimal(shoe.price),
        featured: shoe.featured ?? false,
        brandId,
        images: {
          create: shoe.images.map((url, index) => ({
            url,
            order: index,
          })),
        },
        specs: {
          create: shoe.specs,
        },
        sizes: {
          create: shoe.sizes,
        },
      },
    })

    console.log(`Seeded: ${shoe.name}`)
  }

  console.log(`Seeding finished. Brands: ${brands.length}. Shoes: ${shoes.length}.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error("Seed error:", error)
    await prisma.$disconnect()
    process.exit(1)
  })
