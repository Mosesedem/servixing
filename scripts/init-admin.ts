import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Creating admin user...")

  const adminEmail = "admin@servixing.com"
  const adminPassword = "ChangeMe123!"

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingAdmin) {
      console.log("Admin user already exists")
      return
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        password: hashedPassword,
        role: "admin",
      },
    })

    console.log("✅ Admin user created successfully")
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log("⚠️  Please change the password after first login!")
  } catch (error) {
    console.error("Error creating admin user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
