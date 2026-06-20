import test from "node:test"
import assert from "node:assert/strict"
import {
  buildDiscoveryMeta,
  getRecommendedProducts,
  matchesCollection,
  matchesProductSearch,
  type DiscoveryShoeInput,
} from "./product-discovery"

const baseShoe: DiscoveryShoeInput = {
  id: "shoe-1",
  slug: "air-max-phantom",
  name: "Air Max Phantom",
  description: "A clean runner built for everyday rotation.",
  price: "12990",
  featured: true,
  brand: { name: "Nike" },
  sizes: [
    { size: "40", stock: 8 },
    { size: "41", stock: 2 },
  ],
}

test("product search matches name, brand, description, and generated category", () => {
  const meta = buildDiscoveryMeta(baseShoe, 0)

  assert.equal(matchesProductSearch(baseShoe, meta, "phantom"), true)
  assert.equal(matchesProductSearch(baseShoe, meta, "nike"), true)
  assert.equal(matchesProductSearch(baseShoe, meta, "everyday"), true)
  assert.equal(matchesProductSearch(baseShoe, meta, "lifestyle"), true)
  assert.equal(matchesProductSearch(baseShoe, meta, "samba"), false)
  assert.equal(matchesProductSearch(baseShoe, meta, "   "), true)
})

test("collections match featured, limited stock, family, and budget behavior", () => {
  const featuredMeta = buildDiscoveryMeta(baseShoe, 0)
  const limitedShoe = {
    ...baseShoe,
    id: "shoe-2",
    featured: false,
    sizes: [{ size: "42", stock: 1 }],
  }
  const kidsShoe = {
    ...baseShoe,
    id: "shoe-3",
    name: "Jordan Max Aura Kids",
    slug: "jordan-max-aura-kids",
    price: "3990",
    featured: false,
    brand: { name: "Jordan" },
    sizes: [{ size: "30", stock: 5 }],
  }

  assert.equal(matchesCollection(baseShoe, featuredMeta, "featured"), true)
  assert.equal(matchesCollection(limitedShoe, buildDiscoveryMeta(limitedShoe, 1), "limited-stock"), true)
  assert.equal(matchesCollection(kidsShoe, buildDiscoveryMeta(kidsShoe, 2), "family-size"), true)
  assert.equal(matchesCollection(kidsShoe, buildDiscoveryMeta(kidsShoe, 2), "under-5k"), true)
  assert.equal(matchesCollection(baseShoe, featuredMeta, undefined), true)
})

test("recommendations exclude the current product and prioritize closer products", () => {
  const candidates: DiscoveryShoeInput[] = [
    baseShoe,
    {
      ...baseShoe,
      id: "shoe-2",
      slug: "air-force-shadow",
      name: "Air Force Shadow",
      price: "10990",
    },
    {
      ...baseShoe,
      id: "shoe-3",
      slug: "samba-black-gum",
      name: "Samba Black Gum",
      price: "9290",
      brand: { name: "Adidas" },
      sizes: [{ size: "42", stock: 0 }],
    },
  ]

  const recommendations = getRecommendedProducts(baseShoe, candidates, 2)

  assert.deepEqual(
    recommendations.map((shoe) => shoe.id),
    ["shoe-2", "shoe-3"]
  )
})
