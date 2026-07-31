const fs = require("fs")
const path = require("path")
const { MongoClient } = require("mongodb")

const envPath = path.join(__dirname, "..", ".env")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  }
}

const DATASET_URL =
  "https://raw.githubusercontent.com/mcaupybugs/leetcode-problems-db/master/merged_problems.json"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/daily_tracker"
const DB_NAME = process.env.MONGODB_DB || undefined

async function downloadDataset() {
  const res = await fetch(DATASET_URL)
  if (!res.ok) throw new Error(`Failed to download dataset: ${res.status} ${res.statusText}`)
  const json = await res.json()
  if (!Array.isArray(json.questions)) throw new Error("Unexpected dataset shape")
  return json.questions
}

function normalize(question) {
  return {
    frontendId: Number(question.frontend_id || question.frontendId),
    title: question.title,
    slug: question.problem_slug || question.slug,
    difficulty: ["Easy", "Medium", "Hard"].includes(question.difficulty)
      ? question.difficulty
      : "Medium",
    topics: Array.isArray(question.topics) ? question.topics.filter(Boolean) : [],
    url: `https://leetcode.com/problems/${question.problem_slug || question.slug}/`,
    isPremium: Boolean(question.is_paid_only || question.isPaidOnly),
    createdAt: new Date().toISOString(),
  }
}

async function seed() {
  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const col = db.collection("leetcode_questions")

    const existing = await col.countDocuments({})
    if (existing > 0) {
      console.log(`Found ${existing} questions already in leetcode_questions. Re-seeding (upsert).`)
    }

    console.log(`Downloading dataset from ${DATASET_URL}...`)
    const raw = await downloadDataset()
    console.log(`Downloaded ${raw.length} questions.`)

    const docs = raw.map(normalize).filter((q) => q.slug && q.title)
    const result = await col.bulkWrite(
      docs.map((q) => ({
        updateOne: {
          filter: { slug: q.slug },
          update: { $set: q },
          upsert: true,
        },
      })),
      { ordered: false }
    )

    console.log(`Upserted: matched ${result.matchedCount}, modified ${result.modifiedCount}, upserted ${result.upsertedCount}`)
    const counts = await db
      .collection("leetcode_questions")
      .aggregate([{ $group: { _id: "$difficulty", count: { $sum: 1 } } }])
      .toArray()
    console.log("Difficulty breakdown:")
    for (const c of counts) console.log(`  ${c._id}: ${c.count}`)

    await col.createIndex({ slug: 1 }, { unique: true })
    await col.createIndex({ title: 1 })
    await col.createIndex({ topics: 1 })
    await col.createIndex({ difficulty: 1 })
    console.log("Indexes ensured.")
  } finally {
    await client.close()
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
