import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"

const files = [
  "app/(shop)/account/page.tsx",
  "app/(shop)/account/orders/page.tsx",
  "lib/account-center.ts",
  "lib/account-orders.ts",
]

const brokenCopyPattern = /[\u0080-\u009f\uFFFD]/
const mojibakeThaiPattern = /เธ[\u0080-\u0E7F]/

test("account center copy does not contain mojibake or replacement characters", () => {
  const offenders = files.filter((file) => {
    const source = readFileSync(path.join(process.cwd(), file), "utf8")

    return brokenCopyPattern.test(source) || mojibakeThaiPattern.test(source)
  })

  assert.deepEqual(offenders, [])
})
