import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { profiles } from "../drizzle/schema";
import { createSubscriptionCheckout } from "./stripe";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: router({
    // Get current user's profile
    me: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getProfileByUserId(ctx.user.id);
      if (!profile) return null;
      
      // If nanny, also get nanny profile
      if (profile.role === 'nanny') {
        const nannyProfile = await db.getNannyProfileByProfileId(profile.id);
        return { ...profile, nannyProfile };
      }
      
      return profile;
    }),
    
    // Create profile during onboarding
    create: protectedProcedure
      .input(z.object({
        role: z.enum(['parent', 'nanny', 'admin']),
        fullName: z.string().min(1),
        phone: z.string().optional(),
        city: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createProfile({
          userId: ctx.user.id,
          role: input.role,
          fullName: input.fullName,
          phone: input.phone,
          city: input.city,
        });
        return { success: true };
      }),
    
    // Update profile
    update: protectedProcedure
      .input(z.object({
        fullName: z.string().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        avatarUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Profile not found");
        
        await db.updateProfile(profile.id, input);
        return { success: true };
      }),

    // Upload profile photo
    uploadPhoto: protectedProcedure
      .input(z.object({
        base64Data: z.string(),
        contentType: z.string(),
        fileName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import('./storage');
        
        // Convert base64 to buffer
        const base64WithoutPrefix = input.base64Data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64WithoutPrefix, 'base64');
        
        // Upload to storage
        const key = `profiles/${ctx.user.id}/${input.fileName}`;
        const result = await storagePut(key, buffer, input.contentType);
        
        // Update profile with new photo URL
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (profile) {
          await db.updateProfile(profile.id, { avatarUrl: result.url });
        }
        
        return { url: result.url };
      }),
  }),
  
  nanny: router({
    // Get all available nannies
    list: publicProcedure
      .input(z.object({
        city: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAvailableNannies(input.city);
      }),
    
    // Get nanny by profile ID
    getById: publicProcedure
      .input(z.object({
        profileId: z.number(),
      }))
      .query(async ({ input }) => {
        const profile = await db.getProfileByUserId(input.profileId);
        if (!profile || profile.role !== 'nanny') return null;
        
        const nannyProfile = await db.getNannyProfileByProfileId(profile.id);
        return { profile, nannyProfile };
      }),
    
    // Create nanny profile
    createProfile: protectedProcedure
      .input(z.object({
        bio: z.string().optional(),
        hourlyRate: z.number().optional(),
        yearsExperience: z.number().optional(),
        maxChildren: z.number().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile || profile.role !== 'nanny') {
          throw new Error("User must be a nanny");
        }
        
        await db.createNannyProfile({
          profileId: profile.id,
          bio: input.bio,
          hourlyRate: input.hourlyRate,
          yearsExperience: input.yearsExperience,
          maxChildren: input.maxChildren,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          isAvailable: 1,
        });
        
        return { success: true };
      }),
    
    // Update nanny profile
    updateProfile: protectedProcedure
      .input(z.object({
        bio: z.string().optional(),
        hourlyRate: z.number().optional(),
        yearsExperience: z.number().optional(),
        maxChildren: z.number().optional(),
        tags: z.array(z.string()).optional(),
        isAvailable: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile || profile.role !== 'nanny') {
          throw new Error("User must be a nanny");
        }
        
        const updateData: any = {};
        if (input.bio !== undefined) updateData.bio = input.bio;
        if (input.hourlyRate !== undefined) updateData.hourlyRate = input.hourlyRate;
        if (input.yearsExperience !== undefined) updateData.yearsExperience = input.yearsExperience;
        if (input.maxChildren !== undefined) updateData.maxChildren = input.maxChildren;
        if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags);
        if (input.isAvailable !== undefined) updateData.isAvailable = input.isAvailable ? 1 : 0;
        
        await db.updateNannyProfile(profile.id, updateData);
        return { success: true };
      }),
  }),
  
  subscription: router({
    // Create Stripe checkout session for nanny subscription
    createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
      // Get profile directly from Supabase using UUID
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
      );
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ctx.user.id)
        .single();
      
      if (error || !profile || profile.role !== 'nanny') {
        throw new Error("Only nannies can subscribe");
      }
      
      const origin = ctx.req.headers.origin || 'http://localhost:3000';
      
      const session = await createSubscriptionCheckout({
        userId: ctx.user.id,
        userEmail: ctx.user.email || '',
        userName: profile.full_name || '',
        profileId: profile.id,
        successUrl: `${origin}/app/nanny?subscription=success`,
        cancelUrl: `${origin}/app/nanny/subscription?canceled=true`,
      });
      
      return { url: session.url };
    }),
  }),
  
  booking: router({
    // Create booking request
    create: protectedProcedure
      .input(z.object({
        nannyId: z.number(),
        startTime: z.string(),
        endTime: z.string(),
        address: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile || profile.role !== 'parent') {
          throw new Error("User must be a parent");
        }
        
        await db.createBooking({
          parentId: profile.id,
          nannyId: input.nannyId,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
          address: input.address,
          notes: input.notes,
          status: 'pending',
        });
        
        return { success: true };
      }),
     // Get booking by ID
    getById: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.bookingId);
        if (!booking) return null;
        
        // Get parent and nanny profiles
        const parentProfile = await db.getProfileById(booking.parentId);
        const nannyProfile = await db.getProfileById(booking.nannyId);
        
        return {
          booking,
          parentProfile,
          nannyProfile,
        };
      }),
    
    // Get my bookings (as parent or nanny)
    myBookings: protectedProcedure.query(async ({ ctx }) => {    const profile = await db.getProfileByUserId(ctx.user.id);
      if (!profile) return [];
      
      if (profile.role === 'parent') {
        return await db.getBookingsByParentId(profile.id);
      } else {
        return await db.getBookingsByNannyId(profile.id);
      }
    }),
    
    // Update booking status
    updateStatus: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        status: z.enum(['pending', 'accepted', 'declined', 'cancelled', 'completed']),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile) throw new Error("Profile not found");
        
        const booking = await db.getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        
        // Verify user has permission to update this booking
        if (booking.parentId !== profile.id && booking.nannyId !== profile.id) {
          throw new Error("Not authorized");
        }
        
        await db.updateBookingStatus(input.bookingId, input.status);
        return { success: true };
      }),
  }),
  
  admin: router({
    // Get all profiles (admin only)
    getAllProfiles: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getProfileByUserId(ctx.user.id);
      if (!profile || profile.role !== 'admin') {
        throw new Error("Admin access required");
      }
      
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      
      return await dbInstance.select().from(profiles);
    }),
    
    // Toggle user active status
    toggleUserStatus: protectedProcedure
      .input(z.object({
        profileId: z.number(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (!profile || profile.role !== 'admin') {
          throw new Error("Admin access required");
        }
        
        await db.updateProfile(input.profileId, {
          isActive: input.isActive ? 1 : 0,
        });
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
