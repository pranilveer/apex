const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/daily_tracker"

async function seed() {
  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db()

    const email = "veerpranil@gmail.com"
    const password = "Pranil@9"

    const existing = await db.collection("users").findOne({ email })
    if (existing) {
      console.log("User already exists:", email)
      return
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.collection("users").insertOne({
      email,
      name: "Pranil",
      password: hashedPassword,
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("User created:", email)
  } finally {
    await client.close()
  }
}

seed().catch(console.error)
