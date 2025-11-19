import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  profiles, 
  InsertProfile,
  nannyProfiles,
  InsertNannyProfile,
  bookings,
  InsertBooking
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Profile queries
export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProfileById(profileId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProfile(profile: InsertProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(profiles).values(profile);
}

export async function updateProfile(profileId: number, data: Partial<InsertProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(profiles).set(data).where(eq(profiles.id, profileId));
}

// Nanny profile queries
export async function getNannyProfileByProfileId(profileId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(nannyProfiles).where(eq(nannyProfiles.profileId, profileId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAvailableNannies(city?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(nannyProfiles.isAvailable, 1)];
  if (city) {
    conditions.push(eq(profiles.city, city));
  }
  
  return await db
    .select({
      profile: profiles,
      nannyProfile: nannyProfiles,
    })
    .from(nannyProfiles)
    .innerJoin(profiles, eq(nannyProfiles.profileId, profiles.id))
    .where(and(...conditions));
}

export async function createNannyProfile(nannyProfile: InsertNannyProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(nannyProfiles).values(nannyProfile);
}

export async function updateNannyProfile(profileId: number, data: Partial<InsertNannyProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(nannyProfiles).set(data).where(eq(nannyProfiles.profileId, profileId));
}

// Booking queries
export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(booking);
  return result;
}

export async function getBookingsByParentId(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      booking: bookings,
      nannyProfile: profiles,
    })
    .from(bookings)
    .innerJoin(profiles, eq(bookings.nannyId, profiles.id))
    .where(eq(bookings.parentId, parentId))
    .orderBy(bookings.createdAt);
}

export async function getBookingsByNannyId(nannyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      booking: bookings,
      parentProfile: profiles,
    })
    .from(bookings)
    .innerJoin(profiles, eq(bookings.parentId, profiles.id))
    .where(eq(bookings.nannyId, nannyId))
    .orderBy(bookings.createdAt);
}

export async function updateBookingStatus(bookingId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookings).set({ status: status as any }).where(eq(bookings.id, bookingId));
}

export async function getBookingById(bookingId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
