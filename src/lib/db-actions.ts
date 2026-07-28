import { getDb } from "@/lib/mongodb"
import { auth } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function getUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

export async function getCollection(name: string) {
  const db = await getDb()
  return db.collection(name)
}

export async function findMany<T>(collection: string, query: Record<string, unknown> = {}): Promise<T[]> {
  const userId = await getUserId()
  const col = await getCollection(collection)
  return col.find({ userId, ...query }).sort({ _id: -1 }).toArray() as unknown as T[]
}

export async function findOne<T>(collection: string, query: Record<string, unknown> = {}): Promise<T | null> {
  const userId = await getUserId()
  const col = await getCollection(collection)
  return col.findOne({ userId, ...query }) as unknown as T | null
}

export async function insertOne(collection: string, doc: Record<string, unknown>): Promise<string> {
  const userId = await getUserId()
  const col = await getCollection(collection)
  const result = await col.insertOne({ ...doc, userId, createdAt: new Date().toISOString() })
  return result.insertedId.toString()
}

export async function updateOne(collection: string, id: string, updates: Record<string, unknown>): Promise<void> {
  const userId = await getUserId()
  const col = await getCollection(collection)
  await col.updateOne(
    { _id: new ObjectId(id), userId },
    { $set: { ...updates, updatedAt: new Date().toISOString() } }
  )
}

export async function deleteOne(collection: string, id: string): Promise<void> {
  const userId = await getUserId()
  const col = await getCollection(collection)
  await col.deleteOne({ _id: new ObjectId(id), userId })
}

export async function replaceOne(collection: string, query: Record<string, unknown>, doc: Record<string, unknown>): Promise<void> {
  const userId = await getUserId()
  const col = await getCollection(collection)
  await col.replaceOne(
    { userId, ...query },
    { ...doc, userId, updatedAt: new Date().toISOString() },
    { upsert: true }
  )
}
