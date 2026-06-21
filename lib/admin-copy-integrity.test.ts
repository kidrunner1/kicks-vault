import test from "node:test"
import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const roots = [
  "app/admin",
  "app/api/admin/uploads",
  "lib/admin-upload.ts",
]

const fileExtensions = new Set([".ts", ".tsx"])
const brokenCopyPattern = /[\u0080-\u009f\uFFFD]/
const mojibakeThaiPattern = /เธ[\u0080-\u0E7F]/

function collectFiles(target: string): string[] {
  const absoluteTarget = path.join(process.cwd(), target)
  const stats = statSync(absoluteTarget)

  if (stats.isFile()) {
    return fileExtensions.has(path.extname(target)) ? [target] : []
  }

  return readdirSync(absoluteTarget).flatMap((entry) => {
    const relativePath = path.join(target, entry)
    const absolutePath = path.join(process.cwd(), relativePath)
    const entryStats = statSync(absolutePath)

    if (entryStats.isDirectory()) {
      return collectFiles(relativePath)
    }

    return fileExtensions.has(path.extname(entry)) ? [relativePath] : []
  })
}

test("admin copy does not contain mojibake or replacement characters", () => {
  const files = roots.flatMap(collectFiles)
  const offenders = files.filter((file) => {
    const source = readFileSync(path.join(process.cwd(), file), "utf8")

    return brokenCopyPattern.test(source) || mojibakeThaiPattern.test(source)
  })

  assert.deepEqual(offenders, [])
})
