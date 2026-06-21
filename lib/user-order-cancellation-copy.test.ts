import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"

const files = [
  "app/(shop)/account/orders/[id]/actions.ts",
  "app/(shop)/account/orders/[id]/CancelOrderSection.tsx",
  "app/(shop)/account/orders/[id]/page.tsx",
  "lib/order-cancellation.ts",
  "lib/order-fulfillment.ts",
]

const brokenCopyPattern = /[\u0080-\u009f\uFFFD]/
const mojibakeThaiPattern = /เธ[\u0080-\u0E7F]/

test("user order cancellation copy does not contain mojibake or replacement characters", () => {
  const offenders = files.filter((file) => {
    const source = readFileSync(path.join(process.cwd(), file), "utf8")

    return brokenCopyPattern.test(source) || mojibakeThaiPattern.test(source)
  })

  assert.deepEqual(offenders, [])
})
