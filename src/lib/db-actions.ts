import { getDb } from "@/lib/mongodb"
import { auth } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { cookies } from "next/headers"
import { getToken, decode } from "@auth/core/jwt"

export async function getUserId(): Promise<string> {
  try {
    const session = await auth()
    if (session?.user?.id) return session.user.id
  } catch {
    // auth() threw, fall through to fallback
  }

  const cookieStore = await cookies()
  const cookieHeader = Array.from(cookieStore)
    .map(([, c]) => `${c.name}=${c.value}`)
    .join("; ")

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("Missing AUTH_SECRET")

  // Some Next.js versions strip Cookie from headers() in Server Actions,
  // so we build the cookie header from cookies() instead.
  const parsed = await getToken({
    req: { headers: { cookie: cookieHeader } },
    secret,
  })
  if (parsed?.id) return parsed.id as string

  // If non-secure didn't work, try with secure cookie prefix
  const parsedSecure = await getToken({
    req: { headers: { cookie: cookieHeader } },
    secret,
    secureCookie: true,
  })
  if (parsedSecure?.id) return parsedSecure.id as string

  // Final fallback: try decoding the JWT directly with the cookie name as salt
  const token = cookieStore.get("authjs.session-token")
    ?? cookieStore.get("__Secure-authjs.session-token")
  if (token) {
    for (const salt of ["authjs.session-token", "__Secure-authjs.session-token"]) {
      try {
        const decoded = await decode({ token: token.value, secret, salt })
        if (decoded?.id) return decoded.id as string
      } catch {}
    }
  }

  throw new Error("Unauthorized")
}

export async function getCollection(name: string) {
  const db = await getDb()
  return db.collection(name)
}

export async function findMany<T>(collection: string, query: Record<string, unknown> = {}): Promise<T[]> {
  const userId = await getUserId()
  const col = await getCollection(collection)
  const docs = await col.find({ userId, ...query }).sort({ _id: -1 }).toArray()
  return docs.map(({ _id, ...rest }) => ({ ...rest, id: String(_id) })) as unknown as T[]
}

export async function findManyGlobal<T>(
  collection: string,
  query: Record<string, unknown> = {},
  sort: Record<string, 1 | -1> = { _id: -1 },
  limit = 0,
  skip = 0
): Promise<T[]> {
  const col = await getCollection(collection)
  const docs = await col.find(query).sort(sort).skip(skip).limit(limit).toArray()
  return docs.map(({ _id, ...rest }) => ({ ...rest, id: String(_id) })) as unknown as T[]
}

export async function countDocumentsGlobal(collection: string, query: Record<string, unknown> = {}): Promise<number> {
  const col = await getCollection(collection)
  return col.countDocuments(query)
}

export async function distinctGlobal(collection: string, field: string, query: Record<string, unknown> = {}): Promise<string[]> {
  const col = await getCollection(collection)
  return col.distinct(field, query)
}

export async function findOne<T>(collection: string, query: Record<string, unknown> = {}): Promise<T | null> {
  const userId = await getUserId()
  const col = await getCollection(collection)
  const doc = await col.findOne({ userId, ...query })
  if (!doc) return null
  const { _id, ...rest } = doc as unknown as Record<string, unknown>
  return { ...rest, id: String(_id) } as unknown as T
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
