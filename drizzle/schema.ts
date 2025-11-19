import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Profile extension for users with role-specific information
 */
export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["parent", "nanny", "admin"]).notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  avatarUrl: text("avatarUrl"), // Profile photo
  photoGallery: text("photoGallery"), // JSON array of photo URLs (max 4 additional photos)
  youtubeVideoUrl: varchar("youtubeVideoUrl", { length: 500 }), // YouTube video link for intro
  phone: varchar("phone", { length: 50 }),
  city: varchar("city", { length: 100 }),
  averageRating: int("averageRating").default(0), // Average rating * 100 (e.g., 450 = 4.50 stars)
  reviewCount: int("reviewCount").default(0), // Total number of reviews
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = deactivated by admin
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

/**
 * Extended profile information for nannies
 */
export const nannyProfiles = mysqlTable("nannyProfiles", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull().references(() => profiles.id, { onDelete: "cascade" }).unique(),
  bio: text("bio"),
  hourlyRate: int("hourlyRate"), // Store as cents to avoid decimal issues
  yearsExperience: int("yearsExperience"),
  maxChildren: int("maxChildren"),
  tags: text("tags"), // Store as JSON string: '["baby", "toddler"]'
  isAvailable: int("isAvailable").default(1).notNull(), // 1 = true, 0 = false
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "trialing", "past_due", "canceled", "incomplete"]),
  trialEndsAt: timestamp("trialEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NannyProfile = typeof nannyProfiles.$inferSelect;
export type InsertNannyProfile = typeof nannyProfiles.$inferInsert;

/**
 * Booking requests between parents and nannies
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  parentId: int("parentId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  nannyId: int("nannyId").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  address: text("address").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "accepted", "declined", "cancelled", "completed"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "refunded"]).default("unpaid").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  totalAmount: int("totalAmount"), // Amount in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Reviews for completed bookings
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  reviewerId: int("reviewerId").notNull().references(() => profiles.id, { onDelete: "cascade" }), // Who wrote the review
  revieweeId: int("revieweeId").notNull().references(() => profiles.id, { onDelete: "cascade" }), // Who received the review
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;