import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

async function main() {

  const hashedPassword = await bcrypt.hash("admin123", 10)

  await prisma.user.create({

    data: {

      email: "admin@kicksvault.com",

      password: hashedPassword,

      role: "ADMIN"

    }

  })

  console.log("Admin created")

}

main()
